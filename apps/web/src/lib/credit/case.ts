import { bankKey, isClosed, worse, type CrbReport } from "./crb";
import { computeSpread, fmt, PERIODS, unbalanced, type Column, type SpreadInput } from "./spread";

/**
 * One credit analysis case: everything the "Annex to Loan Application Form"
 * asks for, plus the financial spread. It lives in the analyst's browser only.
 */

export type Exposure = { facility: string; withUs: string; otherBanks: string };
export type Request = { type: string; amount: string; tenor: string; repayment: string };
export type Facility = { type: string; limit: string; outstanding: string; expiry: string; status: "Pass" | "Special mention" | "Substandard" | "Doubtful" | "Loss" };
export type Building = { description: string; owner: string; valuedBy: string; valuedOn: string; value: string; discountPct: string };
export type OtherCollateral = { type: string; origin: string; year: string; insured: "Yes" | "No"; invoice: string; duty: string; net: string; discountPct: string };
export type Shareholder = { name: string; share: string; role: string };
export type Related = { name: string; relation: string; exposure: string };
export type Manager = { name: string; position: string; education: string; experience: string };
export type Project = { name: string; client: string; value: string; completion: string; status: "Ongoing" | "Completed" };
export type ExportRow = { year: string; market: "China" | "Other markets"; commodity: string; volume: string; valueUsd: string };
export type OdRow = { period: string; limit: string; turnover: string; frequency: string; highPct: string; lowPct: string; creditDays: string };
export type LcRow = { ref: string; amount: string; opened: string; settled: string; remark: string };
export type Recommendation = { type: string; amount: string; rate: string; tenure: string; repayment: string; collateral: string };
export type Level = "Low" | "Medium" | "High" | "";
export type AnalystFile = { id: string; name: string; size: number; note: string };

export const riskKeys = [
  { key: "product", label: "Product risk", hint: "Demand, substitutes, shelf life and quality of what the business sells." },
  { key: "market", label: "Market risk", hint: "Competition, price changes, customer concentration and export markets." },
  { key: "profitability", label: "Profitability risk", hint: "How stable margins are, and how sensitive profit is to cost or price changes." },
  { key: "supplier", label: "Supplier risk", hint: "Dependence on few suppliers, imported inputs and foreign currency needs." },
  { key: "environmental", label: "Environmental and social risk", hint: "Licenses, waste, land use, safety and community impact." },
  { key: "collateral", label: "Collateral risk", hint: "Value, marketability, legal title and insurance with the lender named as co-beneficiary." },
] as const;
export type RiskKey = (typeof riskKeys)[number]["key"];

export const ownershipTypes = ["Sole proprietorship", "Private limited company (PLC)", "Share company", "Partnership", "Cooperative", "Public enterprise", "Other"];
export const facilityTypes = ["Overdraft", "Term loan", "Revolving loan", "Merchandise loan", "Pre-shipment export loan", "Letter of credit facility", "Letter of guarantee", "Lease financing", "Other"];
/**
 * The borrower profile builder's sectors (data/credit/profile.ts), each with the
 * sector report used for context by default. The analyst can pick another report.
 */
export const sectorReportFor: Record<string, string> = {
  Agriculture: "agriculture-agro-processing",
  "Domestic trade": "",
  "Services (hotel, health, education, other)": "tourism-hospitality",
  "Manufacturing and industry": "manufacturing",
  Export: "",
  Import: "",
  "Building and construction": "real-estate-construction",
  Transport: "logistics-transport",
  "Personal or household": "",
  Other: "",
};

export const grades = ["", "1", "2", "3", "4", "5", "6", "7"];

export type CreditCase = {
  institution: string;
  branch: string;
  borrower: string;
  region: string;
  city: string;
  subcity: string;
  woreda: string;
  kebele: string;
  established: string;
  relationshipSince: string;
  cif: string;
  ownership: string;
  sector: string;
  sectorReport: string;
  activity: string;
  exporter: boolean;
  importer: boolean;
  officer: string;
  reviewer: string;
  exposure: Exposure[];
  gradePrev: string;
  gradeNow: string;
  received: string;
  completed: string;
  exceptions: string;
  requests: Request[];
  purpose: string;
  facilities: Facility[];
  buildings: Building[];
  otherCollateral: OtherCollateral[];
  engineerRemarks: string;
  background: string;
  shareholders: Shareholder[];
  related: Related[];
  management: Manager[];
  customers: string;
  suppliers: string;
  projects: Project[];
  machineryRental: string;
  exports: ExportRow[];
  visitDate: string;
  visitBy: string;
  visitFindings: string;
  repaymentHistory: string;
  od: OdRow[];
  lcs: LcRow[];
  crb: CrbReport | null;
  ownBank: string;
  crsRef: string;
  crsDate: string;
  otherBanks: string;
  unit: string;
  spread: SpreadInput;
  auditor: string;
  auditQualifications: string;
  salesMix: string;
  notes: Record<string, string>;
  risks: Record<RiskKey, { level: Level; note: string }>;
  gradeJustification: string;
  swot: { s: string; w: string; o: string; t: string };
  recommendations: Recommendation[];
  conditions: string;
  picked: Record<string, boolean>;
  contextUpdate: string;
  additions: Record<string, string>;
  files: AnalystFile[];
};

export const emptyCase = (): CreditCase => ({
  institution: "",
  branch: "",
  borrower: "",
  region: "",
  city: "",
  subcity: "",
  woreda: "",
  kebele: "",
  established: "",
  relationshipSince: "",
  cif: "",
  ownership: ownershipTypes[1],
  sector: "",
  sectorReport: "",
  activity: "",
  exporter: false,
  importer: false,
  officer: "",
  reviewer: "",
  exposure: ["Overdraft", "Term loan", "L/C margin", "Others"].map((facility) => ({ facility, withUs: "", otherBanks: "" })),
  gradePrev: "",
  gradeNow: "",
  received: "",
  completed: "",
  exceptions: "",
  requests: [{ type: "Term loan", amount: "", tenor: "", repayment: "" }],
  purpose: "",
  facilities: [],
  buildings: [],
  otherCollateral: [],
  engineerRemarks: "",
  background: "",
  shareholders: [{ name: "", share: "", role: "" }],
  related: [],
  management: [{ name: "", position: "", education: "", experience: "" }],
  customers: "",
  suppliers: "",
  projects: [],
  machineryRental: "",
  exports: [],
  visitDate: "",
  visitBy: "",
  visitFindings: "",
  repaymentHistory: "",
  od: [],
  lcs: [],
  crb: null,
  ownBank: "",
  crsRef: "",
  crsDate: "",
  otherBanks: "",
  unit: "ETB '000",
  spread: { periods: Array.from({ length: PERIODS }, () => ({ date: "", days: "", type: "" as const })), values: {} },
  auditor: "",
  auditQualifications: "",
  salesMix: "",
  notes: {},
  risks: Object.fromEntries(riskKeys.map((r) => [r.key, { level: "", note: "" }])) as CreditCase["risks"],
  gradeJustification: "",
  swot: { s: "", w: "", o: "", t: "" },
  recommendations: [{ type: "Term loan", amount: "", rate: "", tenure: "", repayment: "", collateral: "" }],
  conditions: "",
  picked: {},
  contextUpdate: "",
  additions: {},
  files: [],
});

/** Plain numbers in the forms (full Birr, not thousands): commas allowed. */
export const amount = (v: string) => {
  const n = Number(String(v).replace(/[,\s]/g, ""));
  return String(v).trim() !== "" && Number.isFinite(n) ? n : NaN;
};
const sum = (xs: number[]) => xs.filter(Number.isFinite).reduce((a, b) => a + b, 0);
export const birr = (n: number) => (Number.isFinite(n) ? `ETB ${Math.round(n).toLocaleString("en-US")}` : "-");
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const times = (n: number) => `${n.toFixed(2)}x`;

export function discounted(value: string, discountPct: string) {
  const v = amount(value);
  const d = amount(discountPct);
  return Number.isFinite(v) ? v * (1 - (Number.isFinite(d) ? d : 0) / 100) : NaN;
}

export function periodLabel(c: Column) {
  if (!c.date) return "";
  const d = new Date(c.date + "T00:00:00Z");
  const label = Number.isNaN(d.getTime()) ? c.date : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
  return c.type ? `${label} (${c.type})` : label;
}

export function analyseCase(k: CreditCase) {
  const cols = computeSpread(k.spread);
  const filled = cols.map((c, i) => ({ c, i })).filter((x) => x.c.filled);
  const latest = filled[0]?.c;
  const prior = filled[1]?.c;
  const oldest = filled[filled.length - 1]?.c;

  const existing = sum(k.exposure.map((e) => amount(e.withUs)));
  const otherBanks = sum(k.exposure.map((e) => amount(e.otherBanks)));
  const requested = sum(k.requests.map((r) => amount(r.amount)));
  const recommended = sum(k.recommendations.map((r) => amount(r.amount)));
  const collateral = sum([...k.buildings.map((b) => discounted(b.value, b.discountPct)), ...k.otherCollateral.map((o) => discounted(o.net || o.invoice, o.discountPct))]);
  const coverage = (base: number) => (base > 0 ? collateral / base : NaN);
  const crsAgeDays = k.crsDate ? Math.floor((Date.now() - Date.parse(k.crsDate)) / 864e5) : NaN;

  return {
    cols,
    latest,
    prior,
    oldest,
    existing,
    otherBanks,
    requested,
    recommended,
    collateral,
    coverExisting: coverage(existing),
    coverRequested: coverage(existing + requested),
    coverRecommended: coverage(existing + (recommended || requested)),
    crsAgeDays,
    balanced: !cols.some(unbalanced),
  };
}
export type CaseAnalysis = ReturnType<typeof analyseCase>;

/**
 * Other banks from the credit reference report: every account and application
 * except those of the analyst's own institution, which the annex reports elsewhere.
 */
export function otherBanks(k: CreditCase) {
  const r = k.crb;
  if (!r) return null;
  const own = k.ownBank ? bankKey(k.ownBank) : "";
  const notOwn = (inst: string) => !own || bankKey(inst) !== own;
  const accounts = r.accounts.filter((a) => notOwn(a.institution));
  const active = accounts.filter((a) => !isClosed(a));
  const settled = accounts.filter((a) => isClosed(a));
  const names = [...new Set(accounts.map((a) => a.institution))];
  const byBank = names
    .map((name) => {
      const act = active.filter((a) => a.institution === name);
      return {
        name,
        active: act.length,
        approved: act.reduce((s, a) => s + a.approved, 0),
        outstanding: act.reduce((s, a) => s + a.balance, 0),
        overdue: act.reduce((s, a) => s + a.overdue, 0),
        worst: act.reduce((w, a) => (a.classification ? worse(a.classification, w) : w), act.length ? "PASS" : ""),
        maxDays: act.reduce((m, a) => Math.max(m, a.daysInArrears), 0),
        settled: settled.filter((a) => a.institution === name).length,
      };
    })
    .sort((a, b) => b.outstanding - a.outstanding);
  const cutoff = r.reportDate ? Date.parse(r.reportDate) - 730 * 864e5 : 0;
  const applications = r.applications.filter((a) => notOwn(a.institution) && (!a.date || Date.parse(a.date) >= cutoff));
  const total = (key: "approved" | "balance" | "overdue") => active.reduce((s, a) => s + a[key], 0);
  return {
    active,
    settled,
    byBank,
    applications,
    approved: total("approved"),
    outstanding: total("balance"),
    overdue: total("overdue"),
    inArrears: active.filter((a) => a.overdue > 0 || a.daysInArrears > 0).length,
    worst: active.reduce((w, a) => (a.classification ? worse(a.classification, w) : w), "PASS"),
    banks: byBank.filter((b) => b.active > 0).length,
  };
}

/** Grouping of bureau credit types into the annex's exposure lines. */
export const exposureLine = (creditType: string) => (/overdraft/i.test(creditType) ? "Overdraft" : /installment|term|loan/i.test(creditType) ? "Term loan" : /letter of credit|l\/c/i.test(creditType) ? "L/C margin" : "Others");

const money = (n: number, unit: string) => `${fmt(n, "amount")} (${unit})`;
const change = (a: number, b: number) => (b !== 0 ? (a - b) / Math.abs(b) : NaN);
const direction = (a: number, b: number, up = "rose", down = "fell") => (a > b ? up : a < b ? down : "held steady");

/**
 * Draft commentary for sections 8.1 to 8.7, written from the spread. The analyst
 * edits or replaces each one; the draft only states what the figures show.
 */
export function draftCommentary(k: CreditCase, a: CaseAnalysis): Record<string, string> {
  const { latest: L, prior: P, oldest: O } = a;
  const u = k.unit;
  const out: Record<string, string> = {};
  if (!L) return out;
  const lp = periodLabel(L);
  const pp = P ? periodLabel(P) : "";

  // 8.1 Fixed assets
  {
    const s: string[] = [`Fixed assets stood at ${money(L.fixedAssets, u)} at ${lp}`];
    if (P) s[0] += `, against ${money(P.fixedAssets, u)} at ${pp}`;
    s[0] += ".";
    if (L.fixedAssets > 0) {
      const parts = [
        ["land and building", L.landBuilding],
        ["machinery and vehicles", L.machinery],
        ["other fixed assets", L.otherFixed],
      ].filter(([, v]) => (v as number) > 0) as [string, number][];
      if (parts.length) s.push(`They comprise ${parts.map(([n, v]) => `${n} ${pct(v / L.fixedAssets)}`).join(", ")}.`);
    }
    if (Number.isFinite(L.capex)) s.push(L.capex >= 0 ? `Capital expenditure for the period is estimated at ${money(L.capex, u)} after depreciation of ${money(L.depTotal, u)}.` : `Fixed assets fell by more than depreciation, which points to disposals or a write-down of ${money(-L.capex, u)}; confirm with the notes to the accounts.`);
    out["8.1"] = s.join(" ");
  }

  // 8.2 Sales
  {
    const s: string[] = [`Net sales were ${money(L.sales, u)} for the ${Math.round(L.days)} days to ${lp}.`];
    if (P && Number.isFinite(L.salesGrowth)) s.push(`On an annualized basis sales ${direction(L.salesGrowth, 0, "grew", "declined")} ${pct(Math.abs(L.salesGrowth))} against ${pp}.`);
    if (O && O !== L && O.sales > 0) {
      const t = L.sales * 365 / L.days / (O.sales * 365 / O.days);
      s.push(`Annualized sales are ${t.toFixed(2)} times the level of ${periodLabel(O)}.`);
    }
    if (k.salesMix.trim()) s.push(k.salesMix.trim());
    out["8.2"] = s.join(" ");
  }

  // 8.3 Profitability
  {
    const s: string[] = [];
    if (Number.isFinite(L.gpMargin)) s.push(`Gross margin was ${pct(L.gpMargin)}${P && Number.isFinite(P.gpMargin) ? ` (${pct(P.gpMargin)} in ${pp})` : ""}.`);
    s.push(`The business made a net ${L.netProfit >= 0 ? "profit" : "loss"} after tax of ${money(Math.abs(L.netProfit), u)}${Number.isFinite(L.npMargin) ? `, a net margin of ${pct(L.npMargin)}` : ""}${P ? `, against a net ${P.netProfit >= 0 ? "profit" : "loss"} of ${money(Math.abs(P.netProfit), u)} in ${pp}` : ""}.`);
    if (Number.isFinite(L.roe)) s.push(`Return on equity was ${pct(L.roe)}.`);
    if (Number.isFinite(L.interestCover)) s.push(`Operating profit covers financial expenses ${times(L.interestCover)}${L.interestCover < 1.5 ? ", a thin margin for new borrowing" : ""}.`);
    if (L.otherIncome + L.interestIncome > 0 && L.pbt > 0 && (L.otherIncome + L.interestIncome) / L.pbt > 0.3) s.push(`Other and interest income make up ${pct((L.otherIncome + L.interestIncome) / L.pbt)} of profit before tax; check how recurring it is.`);
    out["8.3"] = s.join(" ");
  }

  // 8.4 Liquidity
  {
    const s: string[] = [];
    if (Number.isFinite(L.currentRatio)) s.push(`The current ratio is ${times(L.currentRatio)} and the quick ratio ${times(L.quickRatio)}${P && Number.isFinite(P.currentRatio) ? `, against ${times(P.currentRatio)} and ${times(P.quickRatio)} in ${pp}` : ""}.`);
    s.push(`Net current assets are ${money(L.netCurrentAssets, u)}.`);
    if (L.interCoDebtors > 0) s.push(`Inter-company debtors of ${money(L.interCoDebtors, u)} (${pct(L.interCoDebtors / (L.currentAssets || 1))} of current assets) depend on related companies; review their recoverability.`);
    if (L.cash > 0 && L.currentLiab > 0) s.push(`Cash covers ${pct(L.cash / L.currentLiab)} of current liabilities.`);
    out["8.4"] = s.join(" ");
  }

  // 8.5 Leverage
  {
    const s: string[] = [`Tangible net worth is ${money(L.tnw, u)}${P ? `, ${direction(L.tnw, P.tnw)} from ${money(P.tnw, u)}` : ""}.`];
    if (L.tnw <= 0) s.push("Net worth is negative, so the owners have no equity cushion; any facility needs strong mitigants.");
    if (Number.isFinite(L.tlToTnw)) s.push(`Total liabilities are ${times(L.tlToTnw)} net worth, and bank debt ${times(L.bankDebtToTnw)}.`);
    if (Number.isFinite(L.tlToTa)) s.push(`Debt finances ${pct(L.tlToTa)} of total assets.`);
    if (L.shareholderLoans + L.interCoLoans > 0) s.push(`Related party loans of ${money(L.shareholderLoans + L.interCoLoans, u)} could be treated as quasi-equity if the lenders subordinate them to the bank.`);
    out["8.5"] = s.join(" ");
  }

  // 8.6 Working capital
  {
    const s: string[] = [];
    const d = (n: number) => (Number.isFinite(n) ? `${Math.round(n)} days` : "not available");
    s.push(`Stock is held for ${d(L.stockDays)}, customers pay in ${d(L.debtorDays)} and suppliers are paid in ${d(L.creditorDays)}, a working capital cycle of ${Math.round(L.wcCycle)} days${P ? `, against ${Math.round(P.wcCycle)} days at ${pp}` : ""}.`);
    if (Number.isFinite(L.wcPerBirr)) s.push(`Each Birr of sales ties up ${L.wcPerBirr.toFixed(2)} Birr of trading working capital.`);
    if (Number.isFinite(L.wcTotal)) s.push(`Against ${pp}'s days, the change in activity ${L.wcTotal >= 0 ? "released" : "absorbed"} ${money(Math.abs(L.wcTotal), u)} of working capital.`);
    const revolving = k.requests.find((r) => /overdraft|revolving|merchandise|pre-shipment/i.test(r.type));
    const tenorDays = revolving ? amount(revolving.tenor) * 30 : NaN;
    if (revolving && Number.isFinite(tenorDays) && L.wcCycle > tenorDays) s.push(`The cycle is longer than the ${revolving.tenor}-month tenor requested for the ${revolving.type.toLowerCase()}, so the facility may not revolve as planned.`);
    if (P && P.stockDays > 0 && L.stockDays > P.stockDays * 1.5) s.push("Stock days rose sharply; check for slow-moving or obsolete stock.");
    out["8.6"] = s.join(" ");
  }

  // 8.7 Trading outlook
  {
    const s: string[] = [];
    if (P && Number.isFinite(L.salesGrowth)) {
      const liquidityDown = Number.isFinite(L.currentRatio) && Number.isFinite(P.currentRatio) && L.currentRatio < P.currentRatio;
      if (L.salesGrowth > 0.25 && liquidityDown) s.push("Sales are growing fast while liquidity weakens, a sign of possible overtrading; confirm that working capital finance keeps pace with growth.");
      else if (L.salesGrowth > 0) s.push(`Sales momentum is positive at ${pct(L.salesGrowth)} annualized.`);
      else s.push("Sales have softened; the analyst should set out the borrower's plan to restore volumes.");
    }
    const tr = L.trend;
    if (tr.sales && tr.stock && tr.stock > tr.sales * 1.3) s.push("Stock has grown faster than sales since the base period.");
    out["8.7"] = s.join(" ");
  }
  return out;
}

/** Strengths and weaknesses the figures support, offered as SWOT starting points. */
export function swotHints(k: CreditCase, a: CaseAnalysis) {
  const L = a.latest;
  const s: string[] = [];
  const w: string[] = [];
  if (!L) return { s, w };
  if (L.salesGrowth > 0.1) s.push(`Annualized sales growth of ${pct(L.salesGrowth)}.`);
  if (L.salesGrowth < 0) w.push(`Annualized sales down ${pct(-L.salesGrowth)}.`);
  if (L.npMargin > 0.05) s.push(`Net margin of ${pct(L.npMargin)}.`);
  if (L.netProfit < 0) w.push("Loss-making in the latest period.");
  if (L.currentRatio >= 1.5) s.push(`Comfortable liquidity (current ratio ${times(L.currentRatio)}).`);
  if (L.currentRatio < 1) w.push(`Current liabilities exceed current assets (current ratio ${times(L.currentRatio)}).`);
  if (L.tlToTnw > 0 && L.tlToTnw <= 1.5) s.push(`Moderate leverage (liabilities ${times(L.tlToTnw)} net worth).`);
  if (L.tlToTnw > 3 || L.tnw <= 0) w.push("High leverage relative to net worth.");
  if (a.coverRecommended >= 1.25) s.push(`Collateral covers ${pct(a.coverRecommended)} of total exposure.`);
  if (Number.isFinite(a.coverRecommended) && a.coverRecommended < 1) w.push(`Collateral covers only ${pct(a.coverRecommended)} of total exposure.`);
  if (k.facilities.some((f) => f.status !== "Pass")) w.push("At least one existing facility is not classified as pass.");
  const ob = otherBanks(k);
  if (ob && ob.inArrears > 0) w.push(`${ob.inArrears} facilit${ob.inArrears === 1 ? "y" : "ies"} at other banks in arrears (credit reference report).`);
  if (ob && ob.active.length > 0 && ob.inArrears === 0) s.push("All facilities at other banks are current (credit reference report).");
  return { s, w };
}

export const daysOld = (iso: string) => (iso ? Math.floor((Date.now() - Date.parse(iso)) / 864e5) : NaN);
export { change };
