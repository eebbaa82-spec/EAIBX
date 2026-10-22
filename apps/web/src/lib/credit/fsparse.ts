import type { LineId } from "./spread";

/**
 * Turns the words of a set of financial statements (from a PDF's text layer, OCR
 * or a spreadsheet) into the financial analysis form: finds the balance sheet and
 * the profit and loss account, the year columns, and maps each statement line to a
 * form line. Every mapping is shown to the analyst, who can change it before the
 * figures go into the form.
 */

export type Token = { page: number; x0: number; x1: number; y: number; text: string };
export type Section = "nca" | "ca" | "cl" | "ncl" | "eq" | "pl";
export type StatementRow = { label: string; section: Section; values: (number | null)[]; target: LineId | ""; total: string };
export type ParsedStatement = {
  columns: { label: string; date: string }[];
  rows: StatementRow[];
  scale: 1 | 1000 | 1000000;
  audited: boolean;
  source: "text" | "ocr" | "excel";
  checks: { label: string; values: (number | null)[] }[];
};

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/** Groups tokens into lines, top to bottom, left to right. */
export function toLines(tokens: Token[]) {
  const sorted = [...tokens].sort((a, b) => a.page - b.page || a.y - b.y || a.x0 - b.x0);
  const out: Token[][] = [];
  for (const t of sorted) {
    const last = out[out.length - 1];
    const tol = Math.max(3, Math.abs((t.x1 - t.x0) / Math.max(1, t.text.length)) * 0.6);
    if (last && last[0].page === t.page && Math.abs(last[last.length - 1].y - t.y) <= tol) last.push(t);
    else out.push([t]);
  }
  return out.map((l) => l.sort((a, b) => a.x0 - b.x0));
}

const NUM = /^\(?-?\d{1,3}(?:[,\s]\d{3})*(?:\.\d+)?\)?$|^\(?-?\d+(?:\.\d+)?\)?$/;
const DASH = /^[-–—]+$/;

export function parseAmount(s: string): number | null {
  const t = s.replace(/[’']/g, "").trim();
  if (DASH.test(t)) return 0;
  if (!NUM.test(t)) return null;
  const neg = /^\(.*\)$/.test(t) || t.startsWith("-");
  const v = Number(t.replace(/[(),\s-]/g, ""));
  return Number.isFinite(v) ? (neg ? -v : v) : null;
}

const isYear = (s: string) => /^(19|20)\d{2}$/.test(s.replace(/[^\d]/g, "")) && s.replace(/[^\d]/g, "").length === 4;

/** The statement's year-end date, as ISO, if the text names one. */
export function yearEnd(text: string): { day: number; month: number } | null {
  const t = text.toLowerCase();
  const m1 = t.match(new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTHS.join("|")}),?\\s+(19|20)\\d{2}`));
  if (m1) return { day: Number(m1[1]), month: MONTHS.indexOf(m1[2]) + 1 };
  const m2 = t.match(new RegExp(`(${MONTHS.join("|")})\\s+(\\d{1,2}),?\\s+(19|20)\\d{2}`));
  if (m2) return { day: Number(m2[2]), month: MONTHS.indexOf(m2[1]) + 1 };
  return null;
}

type Rule = { re: RegExp; to: LineId; in?: Section[] };

// Ordered: the first rule that matches a line wins.
const rules: Rule[] = [
  // Fixed assets
  { re: /investment propert|^land|^building|land and building/i, to: "landBuilding", in: ["nca"] },
  { re: /^(machinery|vehicle|motor vehicle|plant and machinery|equipment)/i, to: "machinery", in: ["nca"] },
  { re: /property,? plant|fixed asset|furniture|equipment|intangible|right[- ]of[- ]use|work in progress|capital work|construction in progress|deferred tax asset|investment|long[- ]term receivable|other non[- ]current/i, to: "otherFixed", in: ["nca"] },
  // Current assets
  { re: /inventor|stock|work in process|goods in transit|raw material|finished goods/i, to: "stock", in: ["ca"] },
  { re: /(due|receivable|amount owed) from related|related part(y|ies)|inter[- ]?company|sister compan|shareholder/i, to: "interCoDebtors", in: ["ca"] },
  { re: /trade (and other )?receivable|trade debtor|accounts receivable|debtors/i, to: "tradeDebtors", in: ["ca"] },
  { re: /cash|bank balance|deposit(s)? (at|with) bank/i, to: "cash", in: ["ca"] },
  { re: /receivable|prepayment|advance|deposit|staff loan|withholding|vat|tax (asset|recoverable|receivable)/i, to: "otherDebtors", in: ["ca"] },
  { re: /.*/, to: "otherCurrent", in: ["ca"] },
  // Current liabilities
  { re: /overdraft|short[- ]term (loan|borrowing)|bank loan.*current|revolving|merchandise loan/i, to: "shortLoans", in: ["cl"] },
  { re: /current (portion|maturit)|portion of long|current part of/i, to: "currentPortion", in: ["cl"] },
  { re: /(due|payable|amount owed) to related|related part(y|ies)|inter[- ]?company|sister compan|shareholder|director/i, to: "interCoCreditors", in: ["cl"] },
  { re: /trade (and other )?payable|trade creditor|accounts payable|creditors/i, to: "tradeCreditors", in: ["cl"] },
  { re: /(income|profit|business) tax|tax payable|current tax/i, to: "currentTaxes", in: ["cl"] },
  { re: /dividend/i, to: "dividendsPayable", in: ["cl"] },
  { re: /borrowing|loan/i, to: "shortLoans", in: ["cl"] },
  { re: /payable|accru|advance|deposit|provision|deferred|other/i, to: "otherCreditors", in: ["cl"] },
  { re: /.*/, to: "otherCurrentLiab", in: ["cl"] },
  // Term liabilities
  { re: /deferred tax/i, to: "deferredTax", in: ["ncl"] },
  { re: /shareholder|director|owner/i, to: "shareholderLoans", in: ["ncl"] },
  { re: /related part|inter[- ]?company|sister compan/i, to: "interCoLoans", in: ["ncl"] },
  { re: /grant|deferred income/i, to: "grants", in: ["ncl"] },
  { re: /loan|borrowing|lease liabilit|bond/i, to: "ltLoans", in: ["ncl"] },
  { re: /.*/, to: "otherLtCreditors", in: ["ncl"] },
  // Equity
  { re: /share capital|paid[- ]up|capital$|^capital|subscribed/i, to: "capital", in: ["eq"] },
  { re: /retained|accumulated (profit|loss|deficit)|profit and loss account|surplus|deficit/i, to: "retained", in: ["eq"] },
  { re: /reserve/i, to: "reserves", in: ["eq"] },
  { re: /.*/, to: "otherEquity", in: ["eq"] },
  // Profit and loss
  { re: /cost (of )?(sales|goods|revenue|services)|direct cost|cost of production/i, to: "cogs", in: ["pl"] },
  { re: /^(net )?(revenue|sales|turnover|income from (sales|operations|services))|revenue from/i, to: "sales", in: ["pl"] },
  { re: /finance (cost|expense|charge)|interest expense|bank charge|borrowing cost/i, to: "finExp", in: ["pl"] },
  { re: /interest income|finance income/i, to: "interestIncome", in: ["pl"] },
  { re: /(income|profit) tax|tax expense|business profit tax|taxation/i, to: "tax", in: ["pl"] },
  { re: /depreciation|amorti[sz]ation/i, to: "depreciation", in: ["pl"] },
  { re: /loss on (disposal|sale)/i, to: "lossDisposal", in: ["pl"] },
  { re: /other (operating )?income|other gains?|gain on|miscellaneous income|rental income|commission income/i, to: "otherIncome", in: ["pl"] },
  { re: /other (operating )?expense|other losses|impairment|exchange loss|write[- ]?off/i, to: "otherExp", in: ["pl"] },
  { re: /administ|general|selling|distribution|marketing|operating expense|salar|staff cost|employee/i, to: "admin", in: ["pl"] },
  { re: /dividend/i, to: "dividendsPaid", in: ["pl"] },
];

/** Totals and subtotals: used to check the mapping, never put into the form. */
const totals: { re: RegExp; key: string }[] = [
  { re: /total assets/i, key: "Total assets" },
  { re: /total current assets/i, key: "Current assets" },
  { re: /total non[- ]?current assets/i, key: "Fixed assets" },
  { re: /total current liabilities/i, key: "Current liabilities" },
  { re: /total (equity|shareholders'? (equity|fund)|capital and reserves|net worth)/i, key: "Net worth" },
  { re: /gross\W*(profit|loss|margin)/i, key: "Gross profit" },
  { re: /(profit|loss)\)? before (income )?tax|pre[- ]tax/i, key: "Profit before tax" },
  { re: /(net )?(profit|loss)\)? (for|after|of) the (year|period)|net (profit|loss|income)\b|(profit|loss) after tax/i, key: "Net profit" },
];
const subtotal = /^total|^sub[- ]?total|operating (profit|loss)|^(net )?current assets$|net assets|total equity and liabilities|equity and liabilities|liabilities and equity|comprehensive income|^profit|^loss/i;

function sectionOf(label: string, current: Section | null): Section | null {
  const l = label.toLowerCase().replace(/[^a-z' -]/g, " ").replace(/\s+/g, " ").trim();
  if (/^non[- ]?current assets|^fixed assets$|^long[- ]term assets/.test(l)) return "nca";
  if (/^current assets/.test(l)) return "ca";
  if (/^non[- ]?current liabilities|^long[- ]term liabilities|^term liabilities/.test(l)) return "ncl";
  if (/^current liabilities/.test(l)) return "cl";
  if (/^(equity|capital|capital and reserves|shareholders'? (equity|fund)|owners'? equity)( and liabilities)?$|^equity$/.test(l)) return "eq";
  if (/(statement of )?(profit or loss|income statement|comprehensive income|income and expenditure|profit and loss)/.test(l) && !/total/.test(l)) return "pl";
  return current;
}

const endOfStatements = /notes to the financial statements|statement of cash flows?|cash flow statement|statement of changes in equity/i;

export function parseStatement(tokens: Token[], source: ParsedStatement["source"]): ParsedStatement | null {
  const lines = toLines(tokens);
  const fullText = lines.map((l) => l.map((t) => t.text).join(" ")).join("\n");

  const end = yearEnd(fullText);
  const titleYear = fullText.match(/(?:as at|as of|ended|ending)[^\n]*?\b((?:19|20)\d{2})\b/i)?.[1] ?? "";

  // Columns, page by page: amounts line up on their right edges. Small integers
  // (note numbers) and dashes are left out when finding them.
  const isAmount = (t: Token) => parseAmount(t.text) !== null && !isYear(t.text);
  const columnish = (t: Token) => isAmount(t) && !DASH.test(t.text) && !/^\(?\d{1,2}[a-z]?\)?$/i.test(t.text);
  const pages = [...new Set(lines.map((l) => l[0].page))];
  const pageCols = new Map<number, { x: number; label: string }[]>();
  for (const p of pages) {
    const pl = lines.filter((l) => l[0].page === p);
    const xs = pl.flatMap((l) => l.filter(columnish).map((t) => t.x1)).sort((a, b) => a - b);
    const groups: number[][] = [];
    for (const x of xs) {
      const g = groups[groups.length - 1];
      if (g && x - g[g.length - 1] <= 14) g.push(x);
      else groups.push([x]);
    }
    const cols = groups
      .filter((g) => g.length >= 3)
      .map((g) => ({ x: g[Math.floor(g.length / 2)], label: "" }))
      .slice(-5);
    if (!cols.length) continue;
    // Year headings sit over their column.
    for (const l of pl)
      for (const t of l)
        if (isYear(t.text) && !/e\.?c/i.test(l[l.indexOf(t) + 1]?.text ?? "")) {
          const c = cols.find((c) => t.x1 <= c.x + 15 && t.x0 >= c.x - 90);
          if (c && !c.label) c.label = t.text.replace(/[^\d]/g, "");
        }
    // Unlabeled columns: the current year usually has no heading.
    const labeled = cols.filter((c) => c.label);
    if (!labeled.length && titleYear) cols.forEach((c, i) => (c.label = String(Number(titleYear) - i)));
    else if (labeled.length && labeled.length < cols.length) {
      const years = labeled.map((c) => Number(c.label));
      const leftFirst = cols.indexOf(labeled[0]);
      cols.forEach((c, i) => {
        if (!c.label) c.label = String(i < leftFirst ? Math.max(...years) + (leftFirst - i) : Math.min(...years) - (i - cols.indexOf(labeled[labeled.length - 1])));
      });
    }
    pageCols.set(p, cols);
  }
  if (!pageCols.size) return null;
  const allLabels = [...new Set([...pageCols.values()].flat().map((c) => c.label))].sort((a, b) => Number(b) - Number(a)).slice(0, 5);
  const colsFor = (p: number) => pageCols.get(p) ?? pageCols.get([...pageCols.keys()].filter((k) => k < p).pop() ?? [...pageCols.keys()][0])!;

  // A statement line's label: the words from the left margin, up to a wide gap
  // (note references, stamps and signatures sit further right).
  const margin = new Map(pages.map((p) => [p, Math.min(...tokens.filter((t) => t.page === p).map((t) => t.x0))]));
  const atMargin = (l: Token[]) => !!l.length && l[0].x0 <= (margin.get(l[0].page) ?? 0) + 60;
  const labelOf = (words: Token[]) => {
    if (!atMargin(words)) return "";
    const out: Token[] = [];
    for (const t of words) {
      if (out.length && t.x0 - out[out.length - 1].x1 > 28) break;
      out.push(t);
    }
    return out
      .map((t) => t.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .replace(/^[^A-Za-z(]+/, "")
      .replace(/^\(\s+/, "")
      .trim();
  };

  const rows: StatementRow[] = [];
  const checks: ParsedStatement["checks"] = [];
  let section: Section | null = null;
  let bsDone = false;
  let plDone = false;
  let started = false;
  let pending = "";
  let pendingAt = { page: 0, y: 0 };
  const used = new Set<number>();

  for (let li = 0; li < lines.length; li++) {
    if (used.has(li)) continue;
    const l = lines[li];
    const text = l.map((t) => t.text).join(" ");
    if (endOfStatements.test(text) && started && bsDone && plDone) break;
    if (/statement of cash flows?|cash flow statement|statement of changes in equity/i.test(text)) {
      section = null;
      continue;
    }
    const cols = colsFor(l[0].page);
    const amounts = l.filter((t) => isAmount(t) && cols.some((c) => Math.abs(c.x - t.x1) <= 40));
    const words = l.filter((t) => !amounts.includes(t) && t.x1 < Math.min(...cols.map((c) => c.x)) - 70);
    let label = labelOf(words);
    if (!amounts.length) {
      const next = sectionOf(label, section);
      if (next !== section) {
        if (next === "pl" && plDone) section = null;
        else if (next && next !== "pl" && bsDone) section = null;
        else section = next;
        started = started || !!section;
        pending = "";
      } else if (section && label.length > 2 && label.length < 70 && !/^note|birr|etb|^\(|^in |^currency/i.test(label)) {
        pending = label;
        pendingAt = { page: l[0].page, y: l[0].y };
      }
      continue;
    }
    if (!section) continue;
    // Amounts belong to the nearest column of their page.
    const values: (number | null)[] = allLabels.map(() => null);
    for (const t of amounts) {
      const c = cols.reduce((best, c) => (Math.abs(c.x - t.x1) < Math.abs(best.x - t.x1) ? c : best));
      const i = allLabels.indexOf(c.label);
      if (i >= 0) values[i] = parseAmount(t.text);
    }
    if (values.every((v) => v === null)) continue;
    label = label
      .replace(/\s+\d+[a-z]?(\s*,\s*\d+[a-z]?)*\s*$/i, "")
      .replace(/^[\d.]+\s+/, "")
      .replace(/[^A-Za-z)']+$/, "")
      .trim();
    // A label printed a little above or below its amounts lands on its own line.
    if (!label) {
      const nx = lines[li + 1];
      if (nx && nx[0].page === l[0].page && Math.abs(nx[0].y - l[0].y) <= 8 && !nx.some(isAmount)) {
        label = labelOf(nx);
        used.add(li + 1);
      }
    }
    // Or a label just above, whose amounts sit on the line below.
    if (!label && pending && pendingAt.page === l[0].page && l[0].y - pendingAt.y <= 12) label = pending;
    pending = "";
    if (!label) continue;

    const isTax = section === "pl" && /^(income |profit |business )?tax\b|profit tax|income tax/i.test(label) && !/before|after/i.test(label);
    const tot = isTax ? undefined : totals.find((t) => t.re.test(label));
    if (tot) {
      checks.push({ label: tot.key, values });
      if (tot.key === "Net profit" && section === "pl") plDone = true;
      if (/total (equity and liabilities|liabilities and equity|capital and liabilities)/i.test(label)) bsDone = true;
      continue;
    }
    if (!isTax && !/payable/i.test(label) && subtotal.test(label)) {
      if (/total (equity and liabilities|liabilities and equity|capital and liabilities)|equity and liabilities/i.test(label)) bsDone = true;
      continue;
    }
    const rule = rules.find((r) => (!r.in || r.in.includes(section!)) && r.re.test(label));
    let target: LineId | "" = rule?.to ?? "";
    // Other income shown as a loss, and similar sign flips.
    if (target === "otherIncome" && values.some((v) => v !== null && v < 0) && !/net/i.test(label)) target = "otherExp";
    rows.push({ label, section, values, target, total: "" });
  }
  if (!rows.length) return null;

  const iso = (y: string) => (end && /^\d{4}$/.test(y) ? `${y}-${String(end.month).padStart(2, "0")}-${String(end.day).padStart(2, "0")}` : "");
  const scale = /(birr|etb)\s*['’]?\s*000|in thousands|'000/i.test(fullText) ? 1000 : /in millions|(birr|etb) ?million/i.test(fullText) ? 1000000 : 1;

  return {
    columns: allLabels.map((y) => ({ label: y, date: iso(y) })),
    rows,
    scale,
    audited: /independent auditor|auditor'?s report|audited/i.test(fullText),
    source,
    checks,
  };
}

/** Expense and contra lines go into the form as positive amounts. */
export const positiveLines: LineId[] = ["cogs", "directDep", "otherDirect", "admin", "depreciation", "amortization", "remuneration", "finExp", "lossDisposal", "otherExp", "tax", "dividendsPaid"];
