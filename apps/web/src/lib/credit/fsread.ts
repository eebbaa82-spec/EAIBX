import { unzipEntry } from "@/lib/docs/extract";
import { parseStatement, type ParsedStatement, type Token } from "./fsparse";
import type { LineId } from "./spread";

/**
 * Browser loaders for financial statements. PDFs are read with pdf.js; pages with
 * no text layer (scans) are read with OCR. Excel files are read cell by cell, and
 * Investopia's own template is read row by row. Nothing leaves the browser; the OCR
 * engine downloads its program and English language data the first time it runs.
 */

export type Progress = (msg: string) => void;

const vendor = () => `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/vendor`;

async function pdfTokens(buf: ArrayBuffer, progress: Progress, forceOcr = false): Promise<{ tokens: Token[]; ocr: boolean }> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
  // Scanners often compress pages as JBIG2 or JPEG 2000, which pdf.js decodes with
  // its WebAssembly modules; fonts and character maps cover older text PDFs.
  const base = `${vendor()}/pdfjs`;
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buf),
    wasmUrl: `${base}/wasm/`,
    cMapUrl: `${base}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${base}/standard_fonts/`,
    iccUrl: `${base}/iccs/`,
  }).promise;
  const tokens: Token[] = [];
  const scanned: number[] = [];
  const pages = Math.min(doc.numPages, 40);
  for (let p = 1; p <= pages; p++) {
    const page = await doc.getPage(p);
    const vp = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    let chars = 0;
    for (const it of content.items) {
      if (!("str" in it) || !it.str.trim()) continue;
      const [, , , , x, y] = it.transform;
      // Split items that hold several cells ("Inventories 5 1,234 1,100") into words.
      const parts = it.str.split(/\s+/);
      const per = it.width / Math.max(1, it.str.length);
      let offset = 0;
      for (const part of parts) {
        const at = it.str.indexOf(part, offset);
        offset = at + part.length;
        if (!part.trim()) continue;
        tokens.push({ page: p, x0: x + at * per, x1: x + (at + part.length) * per, y: vp.height - y, text: part.trim() });
        chars += part.length;
      }
    }
    if (chars < 40 || forceOcr) scanned.push(p);
  }
  if (scanned.length < pages / 2 && !forceOcr) return { tokens, ocr: false };

  // Scanned statements: render each page and read it with OCR.
  const { createWorker, PSM } = await import("tesseract.js");
  const ocrBase = `${vendor()}/ocr`;
  const worker = await createWorker("eng", 1, { workerPath: `${ocrBase}/worker.min.js`, corePath: ocrBase, langPath: ocrBase, gzip: true, workerBlobURL: false });
  await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT, preserve_interword_spaces: "1" });
  const ocrTokens: Token[] = [];
  try {
    for (const p of scanned) {
      progress(`Reading scanned page ${p} of ${pages}...`);
      const page = await doc.getPage(p);
      const vp = page.getViewport({ scale: 2.5 });
      const canvas = document.createElement("canvas");
      canvas.width = vp.width;
      canvas.height = vp.height;
      await page.render({ canvas, viewport: vp }).promise;
      const { data } = await worker.recognize(canvas, {}, { blocks: true });
      for (const b of data.blocks ?? [])
        for (const para of b.paragraphs)
          for (const line of para.lines)
            for (const w of line.words) {
              const y = (w.bbox.y0 + w.bbox.y1) / 2 / 2.5;
              ocrTokens.push({ page: p, x0: w.bbox.x0 / 2.5, x1: w.bbox.x1 / 2.5, y, text: w.text });
            }
    }
  } finally {
    await worker.terminate();
  }
  return { tokens: [...tokens.filter((t) => !scanned.includes(t.page)), ...ocrTokens], ocr: true };
}

/* ---------- Excel ---------- */

type Cell = { value: string; date?: Date };

const unescape = (s: string) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&apos;/g, "'").replace(/&quot;/g, '"');

/** Which cell styles show dates: built-in date formats and custom ones made of d, m and y. */
function dateStyles(styles: string) {
  const custom = new Map<number, string>();
  for (const m of styles.matchAll(/<numFmt [^>]*numFmtId="(\d+)"[^>]*formatCode="([^"]*)"/g)) custom.set(Number(m[1]), unescape(m[2]));
  const xfs = styles.match(/<cellXfs[^>]*>([\s\S]*?)<\/cellXfs>/)?.[1] ?? "";
  return [...xfs.matchAll(/<xf [^>]*?numFmtId="(\d+)"/g)].map((m) => {
    const id = Number(m[1]);
    if ((id >= 14 && id <= 22) || (id >= 27 && id <= 36) || (id >= 45 && id <= 47) || (id >= 50 && id <= 58)) return true;
    const code = (custom.get(id) ?? "").replace(/"[^"]*"|\[[^\]]*\]/g, "");
    return /[dy]/i.test(code) && !/[#0]/.test(code);
  });
}

function xmlCells(sheet: string, shared: string[], dates: boolean[]) {
  const cells = new Map<string, Cell>();
  for (const m of sheet.matchAll(/<c r="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
    const [, ref, attrs, inner = ""] = m;
    const v = inner.match(/<v>([\s\S]*?)<\/v>/)?.[1];
    const t = attrs.match(/t="(\w+)"/)?.[1];
    const style = Number(attrs.match(/ s="(\d+)"/)?.[1] ?? 0);
    let value = "";
    if (t === "s" && v !== undefined) value = shared[Number(v)] ?? "";
    else if (t === "inlineStr") value = (inner.match(/<t[^>]*>([\s\S]*?)<\/t>/g) ?? []).map((x) => x.replace(/<[^>]+>/g, "")).join("");
    else if (v !== undefined) value = v;
    const serial = Number(value);
    const date =
      t === "d" && !Number.isNaN(Date.parse(value))
        ? new Date(Date.parse(value))
        : (!t || t === "n") && dates[style] && Number.isFinite(serial) && serial > 20000
          ? new Date(Date.UTC(1899, 11, 30) + serial * 864e5)
          : undefined;
    cells.set(ref, { value: unescape(value), date });
  }
  return cells;
}

const colIndex = (ref: string) => ref.replace(/\d+/g, "").split("").reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
const excelDate = (serial: string) => {
  const n = Number(serial);
  if (!Number.isFinite(n) || n < 20000) return "";
  return new Date(Date.UTC(1899, 11, 30) + n * 864e5).toISOString().slice(0, 10);
};
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const templateRows: Record<number, LineId> = {
  9: "landBuilding", 10: "machinery", 11: "otherFixed", 13: "cash", 14: "stock", 15: "tradeDebtors", 16: "otherDebtors", 17: "interCoDebtors", 18: "otherCurrent",
  20: "shortLoans", 21: "currentPortion", 22: "tradeCreditors", 23: "otherCreditors", 24: "interCoCreditors", 25: "currentTaxes", 26: "dividendsPayable", 27: "otherCurrentLiab",
  31: "ltLoans", 32: "deferredTax", 33: "shareholderLoans", 34: "interCoLoans", 35: "otherLtCreditors", 36: "grants", 38: "capital", 39: "reserves", 40: "retained", 41: "otherEquity",
  60: "sales", 61: "cogs", 62: "directDep", 63: "otherDirect", 65: "admin", 66: "depreciation", 67: "amortization", 68: "remuneration", 70: "finExp", 71: "lossDisposal", 72: "otherExp",
  74: "interestIncome", 75: "otherIncome", 78: "tax", 79: "extraordinary", 82: "dividendsPaid", 92: "assetsSold", 94: "revaluation",
};

async function excelStatement(buf: Uint8Array): Promise<ParsedStatement | null> {
  const dec = new TextDecoder();
  const sharedXml = await unzipEntry(buf, "xl/sharedStrings.xml");
  const shared = sharedXml ? [...dec.decode(sharedXml).matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => (m[1].match(/<t[^>]*>([\s\S]*?)<\/t>/g) ?? []).map((x) => x.replace(/<[^>]+>/g, "")).join("")) : [];
  const stylesXml = await unzipEntry(buf, "xl/styles.xml");
  const dates = stylesXml ? dateStyles(dec.decode(stylesXml)) : [];
  const sheets: Map<string, Cell>[] = [];
  for (let i = 1; i <= 12; i++) {
    const xml = await unzipEntry(buf, `xl/worksheets/sheet${i}.xml`);
    if (!xml) break;
    sheets.push(xmlCells(dec.decode(xml), shared, dates));
  }
  // Investopia's financial analysis template (or the lender's original form).
  const sheetText = (c: Map<string, Cell>, ref: string) => c.get(ref)?.value ?? "";
  const found = sheets.find((c) => /land and building/i.test(sheetText(c, "A9")) && /net sales/i.test(sheetText(c, "A60")));
  if (found) {
    const form = { get: (ref: string) => found.get(ref)?.value };
    const cols = ["B", "C", "D", "E", "F"];
    const used = cols.filter((c) => form.get(`${c}6`) || Object.keys(templateRows).some((r) => form.get(`${c}${r}`)));
    return {
      columns: used.map((c) => ({ label: excelDate(form.get(`${c}6`) ?? "").slice(0, 4) || `Column ${c}`, date: excelDate(form.get(`${c}6`) ?? "") })),
      rows: Object.entries(templateRows).map(([r, id]) => ({
        label: form.get(`A${r}`) || id,
        section: Number(r) >= 60 ? "pl" : "ca",
        values: used.map((c) => {
          const v = form.get(`${c}${r}`);
          return v === undefined || v === "" || Number.isNaN(Number(v)) ? null : Number(v);
        }),
        target: id,
        total: "",
      })),
      scale: 1000,
      audited: used.some((c) => /audited/i.test(form.get(`${c}8`) ?? "")),
      source: "excel",
      checks: [],
    };
  }
  // Any other workbook: each row becomes a line of words, laid out by column, and
  // read like a page of statements.
  const tokens: Token[] = [];
  sheets.forEach((cells, s) => {
    for (const [ref, cell] of cells) {
      const { value, date } = cell;
      if (!value.trim()) continue;
      const row = Number(ref.replace(/[A-Z]+/g, ""));
      const x = colIndex(ref) * 200;
      const put = (text: string, i = 0, n = 1) => tokens.push({ page: s + 1, x0: x + (i * 90) / n, x1: x + ((i + 1) * 90) / n, y: row * 100, text });
      if (date) {
        // A date heading: day, month and year, so the year labels the column.
        const parts = [String(date.getUTCDate()), MONTH_NAMES[date.getUTCMonth()], String(date.getUTCFullYear())];
        parts.forEach((p, i) => put(p, i, parts.length));
        continue;
      }
      if (/^-?\d+(\.\d+)?(E-?\d+)?$/i.test(value)) {
        const n = Number(value);
        const yearLike = Number.isInteger(n) && n >= 1990 && n <= 2100 && !/[a-z]{3,}/i.test(cells.get(`A${row}`)?.value ?? "") ;
        const text = yearLike ? String(n) : Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
        put(n < 0 ? `(${text})` : text);
        continue;
      }
      const words = value.trim().split(/\s+/);
      words.forEach((w, i) => put(w, i, words.length));
    }
  });
  return parseStatement(tokens, "excel");
}

/** A CSV export: each row becomes a line, each cell a column, as in a workbook. */
function csvStatement(text: string): ParsedStatement | null {
  const tokens: Token[] = [];
  const sep = (text.split("\n")[0].match(/;/g)?.length ?? 0) > (text.split("\n")[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  text.split(/\r?\n/).forEach((line, row) => {
    const cells: string[] = [];
    let cur = "";
    let quoted = false;
    for (const ch of line) {
      if (ch === '"') quoted = !quoted;
      else if (ch === sep && !quoted) {
        cells.push(cur);
        cur = "";
      } else cur += ch;
    }
    cells.push(cur);
    cells.forEach((cell, col) => {
      const v = cell.trim();
      if (!v) return;
      const words = v.split(/\s+/);
      const x = (col + 1) * 200;
      words.forEach((w, i) => tokens.push({ page: 1, x0: x + (i * 90) / words.length, x1: x + ((i + 1) * 90) / words.length, y: (row + 1) * 100, text: w }));
    });
  });
  return parseStatement(tokens, "excel");
}

export class OldExcelFormat extends Error {}

export async function readStatements(file: File, progress: Progress): Promise<ParsedStatement | null> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xls")) throw new OldExcelFormat();
  const buf = await file.arrayBuffer();
  if (name.endsWith(".csv")) return csvStatement(new TextDecoder().decode(buf));
  if (name.endsWith(".xlsx") || name.endsWith(".xlsm")) {
    const r = await excelStatement(new Uint8Array(buf));
    return r && /audit/i.test(file.name) ? { ...r, audited: true } : r;
  }
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    progress("Reading the PDF...");
    const { tokens, ocr } = await pdfTokens(buf, progress);
    let r = parseStatement(tokens, ocr ? "ocr" : "text");
    // A text layer that gives no statements (a scan with a poor hidden text layer): read the pages again with OCR.
    if (!r && !ocr) {
      const again = await pdfTokens(buf, progress, true);
      r = parseStatement(again.tokens, "ocr");
    }
    return r && /audit/i.test(file.name) ? { ...r, audited: true } : r;
  }
  return null;
}
