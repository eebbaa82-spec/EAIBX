/**
 * Reads a National Bank of Ethiopia credit reference bureau report (the PDF a bank
 * downloads for an enquiry) in the browser, and turns its credit account details
 * into rows for the "Relationship with other banks" table. Nothing is uploaded:
 * the PDF is decompressed with the browser's DecompressionStream and its text is
 * placed by position, since the report draws each field as a separate item.
 */

type Item = { page: number; x: number; y: number; size: number; text: string };

async function inflate(data: Uint8Array) {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function unescape(s: string) {
  return s.replace(/\\([nrtbf()\\]|[0-7]{1,3})/g, (_, c: string) => {
    if (/^[0-7]/.test(c)) return String.fromCharCode(parseInt(c, 8));
    return ({ n: "\n", r: "\r", t: "\t", b: "", f: "", "(": "(", ")": ")", "\\": "\\" } as Record<string, string>)[c] ?? c;
  });
}

/** End of a stream's data: its direct /Length, else before the end-of-line that precedes "endstream". */
export function streamEnd(dict: string, latin: string, start: number, end: number) {
  const len = dict.match(/\/Length\s+(\d+)(?!\s+\d+\s+R)/);
  if (len && start + Number(len[1]) <= end) return start + Number(len[1]);
  let e = end;
  if (latin[e - 1] === "\n") e--;
  if (latin[e - 1] === "\r") e--;
  return e;
}

/** Text items with their positions, page by page, from a PDF's content streams. */
export async function pdfItems(buf: Uint8Array): Promise<Item[]> {
  const latin = new TextDecoder("latin1").decode(buf);
  const items: Item[] = [];
  const re = /stream\r?\n/g;
  let m: RegExpExecArray | null;
  let page = 0;
  while ((m = re.exec(latin))) {
    const dictStart = latin.lastIndexOf("<<", m.index);
    const dict = latin.slice(dictStart, m.index);
    const start = m.index + m[0].length;
    const end = latin.indexOf("endstream", start);
    if (end < 0) break;
    re.lastIndex = end + 9;
    if (/\/Subtype\s*\/Image|\/Type\s*\/XObject/.test(dict) || !/FlateDecode/.test(dict)) continue;
    let content: string;
    try {
      content = new TextDecoder("latin1").decode(await inflate(buf.subarray(start, streamEnd(dict, latin, start, end))));
    } catch {
      continue;
    }
    if (!/\bBT\b/.test(content) || !/T[jJ]/.test(content)) continue;
    page++;
    for (const block of content.match(/BT[\s\S]*?ET/g) ?? []) {
      let x = 0;
      let y = 0;
      let size = 10;
      const ops = block.matchAll(/([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+Tm|([-\d.]+)\s+([-\d.]+)\s+Td|\/\S+\s+([-\d.]+)\s+Tf|\(((?:\\.|[^\\)])*)\)\s*Tj/g);
      for (const o of ops) {
        if (o[1] !== undefined) {
          x = Number(o[5]);
          y = Number(o[6]);
        } else if (o[7] !== undefined) {
          x += Number(o[7]);
          y += Number(o[8]);
        } else if (o[9] !== undefined) size = Number(o[9]);
        else if (o[10] !== undefined) {
          const text = unescape(o[10]).trim();
          if (text) items.push({ page, x, y, size, text });
        }
      }
    }
  }
  return items;
}

/** Items grouped into lines, top to bottom, left to right. */
function lines(items: Item[]) {
  const out: Item[][] = [];
  const sorted = [...items].sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x);
  for (const it of sorted) {
    const last = out[out.length - 1];
    if (last && last[0].page === it.page && Math.abs(last[0].y - it.y) < 3) last.push(it);
    else out.push([it]);
  }
  return out.map((l) => l.sort((a, b) => a.x - b.x));
}

export type CrbAccount = {
  institution: string;
  office: string;
  accountNo: string;
  role: string;
  approved: number;
  opened: string;
  creditType: string;
  productType: string;
  maturity: string;
  frequency: string;
  installment: number;
  balance: number;
  status: string;
  statusDate: string;
  classification: string;
  daysInArrears: number;
  overdue: number;
  restructured: string;
  sector: string;
  collateral: number;
  guarantee: number;
  adverse: boolean;
};

export type CrbApplication = { institution: string; date: string; amount: number; approved: number; status: string };

export type CrbReport = {
  enquiryId: string;
  reportDate: string;
  subject: string;
  tin: string;
  accounts: CrbAccount[];
  applications: CrbApplication[];
  summary: { label: string; value: string }[];
};

const n = (v?: string) => {
  const x = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(x) ? x : 0;
};

// Section headings of the bureau report; any of them ends the section being read.
const HEADINGS = /^(Criteria used for this Enquiry|Individual Identification Information|Company Identification Information|Credit Report Summary|Group Summary|Stakeholder.*|Credit Accounts|Adverse Credit Accounts|Credit Applications|(General|Vehicle|Building|Financial Asset) Collateral Type( Information)?|Previous Bureau Credit Report Enquiries|Contact Numbers|Addresses|Employment and Income Information|Credit Account Detail|Adverse Credit Account Detail)$/i;
const furniture = (l: Item[]) => /^(ENQUIRY ID|TIN|BORROWER|PAGE)/i.test(l[0].text) || (l.length === 2 && l[0].text === "Field" && l[1].text === "Data");

export async function readCrb(file: File): Promise<CrbReport | null> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const items = await pdfItems(buf);
  if (!items.length) return null;
  const ls = lines(items);
  const text = (l: Item[]) => l.map((i) => i.text).join(" ");
  const all = ls.map(text);
  const after = (label: RegExp) => {
    for (const l of ls) {
      const i = l.findIndex((it) => label.test(it.text));
      if (i >= 0 && l[i + 1]) return l[i + 1].text;
    }
    return "";
  };
  if (!all.some((t) => /Credit Report/i.test(t)) || !all.some((t) => /Enquiry/i.test(t))) return null;

  // Credit account details: two columns, field name then value, one field per line.
  const accounts: CrbAccount[] = [];
  let section = "";
  let rec: Record<string, string> | null = null;
  let adverse = false;
  const flush = () => {
    if (rec && rec["Institution"]) {
      accounts.push({
        institution: rec["Institution"],
        office: rec["Office"] ?? "",
        accountNo: rec["Account Number"] ?? "",
        role: rec["Role in Credit Account"] ?? "",
        approved: n(rec["Approved Amount"] || rec["Opening Balance / Credit Limit"]),
        opened: rec["Date Account Opened"] ?? "",
        creditType: rec["Credit Type"] ?? "",
        productType: rec["Product Type"] ?? "",
        maturity: rec["Maturity Date"] ?? "",
        frequency: rec["Repayment Frequency"] ?? "",
        installment: n(rec["Installment Amount"]),
        balance: n(rec["Current Balance Amount"]),
        status: rec["Credit Account Status"] ?? "",
        statusDate: rec["Last Status Change Date"] ?? "",
        classification: rec["Credit Account Risk Classification"] ?? "",
        daysInArrears: n(rec["Number of Days in Arrears"]),
        overdue: n(rec["Balance Overdue"]),
        restructured: rec["Restructured Credit"] ?? "",
        sector: [rec["Industry Sector"], rec["Industry Sub-Sector"]].filter(Boolean).join(", "),
        collateral: ["General", "Vehicle", "Building", "Financial Asset"].reduce((s, k) => s + n(rec![`Supported by ${k} Collateral Type Total Market Value`]), 0),
        guarantee: n(rec["Secured by Guarantor Total"]),
        adverse,
      });
    }
    rec = null;
  };
  for (const l of ls) {
    const t = text(l);
    if (/^Adverse Credit Account Detail$/i.test(t)) {
      flush();
      section = "detail";
      adverse = true;
      continue;
    }
    if (/^Credit Account Detail$/i.test(t)) {
      flush();
      section = "detail";
      adverse = false;
      continue;
    }
    if (section !== "detail") continue;
    if (furniture(l)) continue;
    if (HEADINGS.test(t)) {
      flush();
      section = "";
      continue;
    }
    const parts = l;
    const label = parts[0].text;
    const value = parts
      .slice(1)
      .map((p) => p.text)
      .join(" ");
    if (label === "Institution") {
      flush();
      rec = {};
    }
    if (rec) rec[label] = value;
  }
  flush();

  // Credit applications: a grid of labels with the values on the line below.
  const applications: CrbApplication[] = [];
  let inApps = false;
  let app: Record<string, string> | null = null;
  const pushApp = () => {
    if (app?.Institution) applications.push({ institution: app.Institution, date: app["Application Date"] ?? "", amount: n(app["Application Amount"]), approved: n(app["Approved Amount"]), status: app["Application Status"] ?? "" });
    app = null;
  };
  for (let i = 0; i < ls.length; i++) {
    const t = text(ls[i]);
    if (/^Credit Applications$/.test(t)) {
      inApps = true;
      continue;
    }
    if (!inApps) continue;
    if (furniture(ls[i])) continue;
    if (HEADINGS.test(t)) {
      pushApp();
      break;
    }
    const first = ls[i][0].text;
    if (first === "Institution" || first === "Office") {
      if (first === "Institution") {
        pushApp();
        app = {};
      }
      if (app) app[first] = ls[i].slice(1).map((p) => p.text).join(" ");
      continue;
    }
    const labels = ls[i].map((it) => it.text);
    if (app && labels.some((x) => /^(Application Date|Application Status|Approved Amount)$/.test(x))) {
      const values = ls[i + 1] ?? [];
      const valuesAreLabels = values.some((v) => /Amount|Date|Status|Reason|Role|Secured/.test(v.text) && !/\d/.test(v.text));
      if (valuesAreLabels) continue;
      // Each value belongs to the label column nearest to it.
      const centers = ls[i].map((it) => it.x + it.text.length * it.size * 0.25);
      for (const v of values) {
        const c = v.x + v.text.length * v.size * 0.25;
        let best = 0;
        centers.forEach((x, j) => {
          if (Math.abs(x - c) < Math.abs(centers[best] - c)) best = j;
        });
        app[labels[best]] = v.text;
      }
      i++;
    }
  }
  pushApp();

  const summaryLabels = ["Cumulative Current Balance", "Cumulative Installment", "Cumulative Arrears Amount", "Number Of Adverse Credit Accounts", "Worst Ever Months in Arrears"];
  const summary: { label: string; value: string }[] = [];
  for (let i = 0; i < ls.length - 1; i++) {
    const labels = ls[i].filter((it) => summaryLabels.includes(it.text));
    if (!labels.length) continue;
    for (const lab of labels) {
      const v = ls[i + 1].reduce<Item | null>((best, it) => (!best || Math.abs(it.x - lab.x) < Math.abs(best.x - lab.x) ? it : best), null);
      if (v && /^[\d.,-]+$/.test(v.text)) summary.push({ label: lab.text, value: v.text });
    }
  }

  return {
    enquiryId: after(/^Enquiry ID:?$/i) || after(/^ENQUIRY ID:?$/),
    reportDate: after(/^Report Generation Date:?$/i),
    subject: after(/^BORROWER:?$/),
    tin: after(/^TIN:?$/),
    accounts,
    applications,
    summary,
  };
}

export const isClosed = (a: Pick<CrbAccount, "status" | "balance">) => /settle|closed|written off|paid/i.test(a.status) && a.balance === 0;

/** Normalizes an institution name for matching ("Bank SC", "S.C.", case, spaces). */
export const bankKey = (s: string) =>
  s
    .toLowerCase()
    .replace(/\b(s\.?\s?c\.?|share company|plc)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Worst arrears per account, as the bureau's risk classification reports it. */
export const classOrder = ["PASS", "SPECIAL MENTION", "SUBSTANDARD", "DOUBTFUL", "LOSS"];
export const worse = (a: string, b: string) => (classOrder.indexOf(a.toUpperCase()) >= classOrder.indexOf(b.toUpperCase()) ? a : b);
