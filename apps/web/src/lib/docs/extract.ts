/**
 * Reads the text of a document in the browser, so the profile builder can suggest
 * answers from a company profile. No library and no upload: Word (.docx) files are
 * unzipped with the browser's DecompressionStream, PDFs with a text layer are read
 * best-effort, and plain text is read as is. Scans, images and old .doc files return
 * no text; they can still be attached.
 */

async function inflate(data: Uint8Array, format: "deflate" | "deflate-raw") {
  const stream = new Blob([data as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Returns one file from a zip archive, or null. */
async function unzipEntry(buf: Uint8Array, wanted: string) {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return null;
  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();
  for (let k = 0; k < count && p + 46 <= buf.length; k++) {
    if (view.getUint32(p, true) !== 0x02014b50) return null;
    const method = view.getUint16(p + 10, true);
    const size = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const local = view.getUint32(p + 42, true);
    const name = decoder.decode(buf.subarray(p + 46, p + 46 + nameLen));
    if (name === wanted) {
      const start =
        local +
        30 +
        view.getUint16(local + 26, true) +
        view.getUint16(local + 28, true);
      const raw = buf.subarray(start, start + size);
      if (method === 0) return raw;
      if (method === 8) return inflate(raw, "deflate-raw");
      return null;
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return null;
}

function decodeXmlText(xml: string) {
  return xml
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:br\/>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

async function docxText(buf: Uint8Array) {
  const doc = await unzipEntry(buf, "word/document.xml");
  return doc ? decodeXmlText(new TextDecoder().decode(doc)) : "";
}

function pdfString(s: string) {
  return s.replace(/\\([nrtbf()\\]|[0-7]{1,3})/g, (_, c: string) => {
    if (/^[0-7]/.test(c)) return String.fromCharCode(parseInt(c, 8));
    return (
      (
        {
          n: "\n",
          r: "\r",
          t: "\t",
          b: "",
          f: "",
          "(": "(",
          ")": ")",
          "\\": "\\",
        } as Record<string, string>
      )[c] ?? c
    );
  });
}

async function pdfText(buf: Uint8Array) {
  const latin = new TextDecoder("latin1").decode(buf);
  const out: string[] = [];
  const re = /<<([^]*?)>>\s*stream\r?\n/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(latin)) && out.length < 400) {
    const start = m.index + m[0].length;
    const end = latin.indexOf("endstream", start);
    if (end < 0) break;
    let body = buf.subarray(start, end);
    try {
      if (/FlateDecode/.test(m[1])) body = await inflate(body, "deflate");
      else if (/\/Filter/.test(m[1])) continue;
    } catch {
      continue;
    }
    const content = new TextDecoder("latin1").decode(body);
    if (!/BT[\s\S]*ET/.test(content)) continue;
    for (const block of content.match(/BT[\s\S]*?ET/g) ?? []) {
      const parts: string[] = [];
      for (const t of block.match(
        /\((?:\\.|[^\\)])*\)\s*(?:Tj|'|")|\[(?:[^\]])*\]\s*TJ/g,
      ) ?? []) {
        for (const s of t.match(/\((?:\\.|[^\\)])*\)/g) ?? [])
          parts.push(pdfString(s.slice(1, -1)));
      }
      if (parts.length) out.push(parts.join(""));
    }
  }
  const text = out.join("\n");
  // Fonts with custom encodings come out as noise; only keep text that reads as words.
  const letters = (text.match(/[A-Za-z]/g) ?? []).length;
  return letters > 40 &&
    letters / Math.max(1, text.replace(/\s/g, "").length) > 0.6
    ? text
    : "";
}

export async function readText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  try {
    if (name.endsWith(".txt") || file.type === "text/plain")
      return await file.text();
    const buf = new Uint8Array(await file.arrayBuffer());
    if (name.endsWith(".docx")) return await docxText(buf);
    if (name.endsWith(".pdf") || file.type === "application/pdf")
      return await pdfText(buf);
  } catch {
    return "";
  }
  return "";
}

export type Found = { field: string; label: string; value: string };

const sectorWords: [string, RegExp][] = [
  [
    "Agriculture",
    /\b(farm|agricultur|crop|livestock|horticultur|irrigation|coffee plantation)/gi,
  ],
  ["Domestic trade", /\b(wholesal|retail|distribut|trading)/gi],
  [
    "Services (hotel, health, education, other)",
    /\b(hotel|hospital|clinic|school|college|consult|tour|restaurant|service provider)/gi,
  ],
  [
    "Manufacturing and industry",
    /\b(manufactur|factory|plant|production line|processing|industr)/gi,
  ],
  ["Export", /\b(export)/gi],
  ["Import", /\b(import)/gi],
  [
    "Building and construction",
    /\b(construction|contractor|real estate|building)/gi,
  ],
  ["Transport", /\b(transport|logistics|truck|freight)/gi],
];

/** Picks likely profile answers out of a company profile's text. Every suggestion is shown for the user to accept. */
export function findDetails(text: string): Found[] {
  const found: Found[] = [];
  const add = (field: string, label: string, value: string | undefined) => {
    const v = value?.replace(/\s+/g, " ").trim();
    if (v && !found.some((f) => f.field === field))
      found.push({ field, label, value: v });
  };
  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  add(
    "name",
    "Business name",
    lines.find(
      (l) =>
        l.length < 90 &&
        /\b(P\.?L\.?C\.?|PLC|Share Company|S\.C\.|Private Limited Company|Enterprise|Trading|Industries)\b/i.test(
          l,
        ),
    ),
  );
  add(
    "tin",
    "TIN",
    text.match(
      /\b(?:TIN|Tax\s*(?:payer)?\s*Identification\s*(?:No\.?|Number)?)\D{0,20}(\d{10})\b/i,
    )?.[1],
  );
  add(
    "licence",
    "Trade licence number",
    text.match(
      /\b(?:trade|business)\s+licen[cs]e\s*(?:no\.?|number|#)?\s*[:.-]?\s*([A-Z0-9][A-Z0-9/\-]{4,})/i,
    )?.[1],
  );
  add(
    "started",
    "Year the business started",
    text.match(
      /\b(?:established|founded|incorporated|registered|started|since)\b\D{0,30}((?:19|20)\d{2})\b/i,
    )?.[1],
  );
  add(
    "email",
    "Email",
    text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)?.[0],
  );
  add(
    "phone",
    "Phone",
    text.match(/(?:\+251|\b0)\s?[79]\d(?:[\s-]?\d){7}\b/)?.[0],
  );
  add(
    "address",
    "Address",
    text
      .match(
        /[^\n]{0,60}\b(?:Addis Ababa|Sub[- ]?city|Woreda|Kebele|P\.?\s?O\.?\s?Box)\b[^\n]{0,60}/i,
      )?.[0]
      .replace(/^\s*(?:head office\s*)?address\s*[:\-]\s*/i, ""),
  );
  add(
    "manager",
    "General manager",
    text.match(
      /\b(?:General Manager|Managing Director|Chief Executive Officer|CEO|Founder|Owner)\b[ \t]*[:\-–,]?[ \t]*((?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Ato|W\/ro)?[ \t]*[A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+){1,2})/,
    )?.[1],
  );
  const capital = text.match(
    /\b(?:paid[- ]up|registered|initial)\s+capital\b\D{0,25}([\d,.]+)\s*(million|m\b)?/i,
  );
  if (capital) {
    const n =
      Number(capital[1].replace(/,/g, "")) * (capital[2] ? 1_000_000 : 1);
    if (Number.isFinite(n) && n > 0)
      add("equity", "Paid-up capital (ETB)", String(Math.round(n)));
  }
  let best = "";
  let bestCount = 1;
  for (const [sector, re] of sectorWords) {
    const c = (text.match(re) ?? []).length;
    if (c > bestCount) {
      best = sector;
      bestCount = c;
    }
  }
  add("sector", "Sector", best);
  return found;
}
