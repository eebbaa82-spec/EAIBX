import { bankKey, isClosed, worse, type CrbReport } from "./crb";
import { appraise, emptyProject, type ProjectInput } from "./project";
import { emptyProjection, projection, type ProjectionInput } from "./projection";
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

/** Risk areas, following the risk management procedure: credit, liquidity, interest rate, foreign exchange and operational risk, applied to one borrower. */
export const riskKeys = [
  { key: "credit", label: "Credit risk", hint: "Capacity to repay from profit and cash flow, repayment record here and at other banks." },
  { key: "liquidity", label: "Liquidity risk", hint: "Whether current assets cover obligations as they fall due, and the length of the cash cycle." },
  { key: "interest", label: "Interest rate risk", hint: "How far a rise in lending rates would cut profit and interest cover." },
  { key: "fx", label: "Foreign exchange risk", hint: "Exposure of costs and income to a weaker birr through imported inputs or export sales." },
  { key: "concentration", label: "Concentration risk", hint: "Dependence on few customers or suppliers, and the size of the exposure against the lender's capital." },
  { key: "operational", label: "Operational risk", hint: "Fraud, business disruption, damage to physical assets, process failures and insurance." },
  { key: "legal", label: "Legal and compliance risk", hint: "Legal capacity to borrow, valid licences and tax clearance, and enforceable contracts and collateral." },
  { key: "strategic", label: "Strategic and market risk", hint: "Position in the sector, competition, management expertise and the sales trend." },
  { key: "reputation", label: "Reputation and integrity risk", hint: "Integrity, reputation and conduct of the borrower and its owners." },
  { key: "collateral", label: "Collateral risk", hint: "Coverage, marketability, legal title, insurance, and coverage if property values fall." },
] as const;
export type RiskKey = (typeof riskKeys)[number]["key"];

/** Non-financial questions the analyst answers for every case. */
export const questions = [
  { key: "management", label: "Management", ask: "How experienced is the management team in this business, and what is its track record?" },
  { key: "governance", label: "Ownership and succession", ask: "Who controls the business? Is it dependent on one person, and is there a successor?" },
  { key: "market", label: "Market position", ask: "How strong is the business against its competitors? Is demand for its products growing?" },
  { key: "customers", label: "Customers", ask: "Is the business dependent on a few customers? Do customers pay on time?" },
  { key: "suppliers", label: "Suppliers and inputs", ask: "Are inputs readily available? How much depends on imports or foreign currency?" },
  { key: "operations", label: "Operations and capacity", ask: "Are premises, equipment and staff adequate? How much of capacity is used?" },
  { key: "compliance", label: "Licences and tax compliance", ask: "Are the trade licence, permits and tax clearance valid and up to date?" },
  { key: "plan", label: "Use of the loan and repayment", ask: "Is the purpose sound, and will the financed activity generate the cash to repay?" },
  { key: "character", label: "Character and conduct", ask: "What is the borrower's reputation, and how have they conducted their accounts and commitments?" },
  { key: "environment", label: "Environment, safety and insurance", ask: "Does the business manage environmental and safety risks, and are its assets insured?" },
] as const;
export type QuestionKey = (typeof questions)[number]["key"];
export type Rating = "Strong" | "Adequate" | "Weak" | "";

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
  importShare: string;
  lenderCapital: string;
  projection: ProjectionInput;
  project: ProjectInput;
  assessment: Partial<Record<QuestionKey, { rating: Rating; note: string }>>;
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
  assessment: {},
  importShare: "",
  lenderCapital: "",
  projection: emptyProjection(),
  project: emptyProject(),
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

const pctText = (n: number) => `${(n * 100).toFixed(0)}%`;

const unitScale: Record<string, number> = { "ETB '000": 1000, ETB: 1, "ETB million": 1000000 };
const levelOrder: Level[] = ["", "Low", "Medium", "High"];
const higher = (x: Level, y: Level): Level => (levelOrder.indexOf(x) >= levelOrder.indexOf(y) ? x : y);

export type Stress = { name: string; shock: string; pbt: number; cover: number; result: "Withstands" | "Weakens" | "Fails"; collateral?: boolean };

/**
 * Forward-looking scenarios on the latest period, as the procedure asks for a
 * capacity-to-repay analysis under various scenarios: lower sales, higher costs,
 * higher interest rates, a weaker birr and lower property values.
 */
export function stressTests(k: CreditCase, a: CaseAnalysis): Stress[] {
  const L = a.latest;
  const out: Stress[] = [];
  if (L) {
    const scale = unitScale[k.unit] ?? 1000;
    const year = (L.days || 365) / 365;
    const newDebt = (a.recommended || a.requested || 0) / scale;
    const extraInterest = (pts: number) => (L.bankDebt + newDebt) * (pts / 100) * year;
    const direct = L.cogs + L.otherDirect;
    const importShare = Math.min(100, Math.max(0, amount(k.importShare) || (k.importer ? 50 : 0))) / 100;
    const run = (name: string, shock: string, profitHit: number, interestUp: number) => {
      const finExp = L.finExp + interestUp;
      const pbt = L.pbt - profitHit - interestUp;
      const cover = finExp > 0 ? (pbt + finExp) / finExp : NaN;
      const result = pbt > 0 && (!Number.isFinite(cover) || cover >= 1.5) ? "Withstands" : pbt >= 0 || cover >= 1 ? "Weakens" : "Fails";
      out.push({ name, shock, pbt, cover, result });
    };
    run("Current position", "Latest period as reported", 0, 0);
    run("Lower sales", "Sales 20% lower, direct costs falling with them", 0.2 * L.grossProfit, 0);
    run("Higher input costs", "Direct costs 10% higher", 0.1 * direct, 0);
    run("Higher interest rates", "Lending rates 3 points higher, proposed facility included", 0, extraInterest(3));
    if (importShare > 0) run("Weaker birr", `Birr 20% weaker against the dollar, ${Math.round(importShare * 100)}% of direct costs imported`, 0.2 * direct * importShare, 0);
    run("Combined", "Sales 10% lower, direct costs 5% higher and rates 3 points higher", 0.1 * L.grossProfit + 0.05 * direct, extraInterest(3));
  }
  if (Number.isFinite(a.coverRecommended)) {
    const cover = a.coverRecommended * 0.7;
    out.push({ name: "Lower property values", shock: "Collateral worth 30% less", pbt: NaN, cover, result: cover >= 1 ? "Withstands" : cover >= 0.8 ? "Weakens" : "Fails", collateral: true });
  }
  return out;
}

/** Risk levels set from the figures, the credit report and the business assessment; the analyst can override any. */
export function suggestedRisks(k: CreditCase, a: CaseAnalysis): Partial<Record<RiskKey, { level: Level; why: string }>> {
  const L = a.latest;
  const stress = stressTests(k, a);
  const st = (name: string) => stress.find((s) => s.name === name);
  const rating = (q: QuestionKey) => k.assessment[q]?.rating ?? "";
  const fromRating = (q: QuestionKey): Level => (rating(q) === "Strong" ? "Low" : rating(q) === "Adequate" ? "Medium" : rating(q) === "Weak" ? "High" : "");
  const parts: Partial<Record<RiskKey, { level: Level; why: string }[]>> = {};
  const note = (key: RiskKey, level: Level, why: string) => {
    if (level) (parts[key] ??= []).push({ level, why });
  };
  const rated = (key: RiskKey, q: QuestionKey) => rating(q) && note(key, fromRating(q), `${questions.find((x) => x.key === q)?.label.toLowerCase()} rated ${rating(q).toLowerCase()}`);
  const ob = otherBanks(k);

  // Credit risk: capacity to repay and repayment record.
  if (L) {
    if (L.pbt < 0) note("credit", "High", "the latest period shows a loss before tax");
    else if (Number.isFinite(L.interestCover)) note("credit", L.interestCover < 1 ? "High" : L.interestCover < 2 ? "Medium" : "Low", `interest cover is ${L.interestCover.toFixed(2)}x`);
    else note("credit", L.npMargin < 0.03 ? "Medium" : "Low", `net margin is ${pctText(L.npMargin)} with no finance cost`);
  }
  if (ob) note("credit", ob.inArrears ? "High" : "Low", ob.inArrears ? `${ob.inArrears} facilit${ob.inArrears === 1 ? "y" : "ies"} in arrears at other banks` : "facilities at other banks are current");
  const bad = k.facilities.filter((f) => f.status !== "Pass").length;
  if (k.facilities.length) note("credit", bad ? "High" : "Low", bad ? `${bad} present facilit${bad === 1 ? "y is" : "ies are"} not classified pass` : "present facilities are classified pass");

  // Liquidity risk.
  if (L && Number.isFinite(L.currentRatio)) {
    note("liquidity", L.currentRatio < 1 ? "High" : L.currentRatio < 1.2 ? "Medium" : "Low", `current ratio ${L.currentRatio.toFixed(2)}x${Number.isFinite(L.quickRatio) ? `, quick ratio ${L.quickRatio.toFixed(2)}x` : ""}`);
    if (Number.isFinite(L.wcCycle) && L.wcCycle > 180) note("liquidity", "Medium", `cash cycle of ${Math.round(L.wcCycle)} days`);
  }

  // Interest rate risk: rates 3 points higher.
  const rate = st("Higher interest rates");
  if (rate) note("interest", rate.result === "Fails" ? "High" : rate.result === "Weakens" ? "Medium" : "Low", Number.isFinite(rate.cover) ? `interest cover would be ${rate.cover.toFixed(2)}x with rates 3 points higher` : "little bank debt");

  // Foreign exchange risk.
  const fx = st("Weaker birr");
  if (fx) note("fx", fx.result === "Fails" ? "High" : fx.result === "Weakens" ? "Medium" : "Low", `with a 20% weaker birr, profit before tax would be ${fmt(fx.pbt, "amount")} (${k.unit})`);
  else if (k.exporter) note("fx", "Low", "export earnings in foreign currency");
  else if (L) note("fx", "Low", "no imported inputs or foreign currency obligations reported");

  // Concentration risk.
  rated("concentration", "customers");
  rated("concentration", "suppliers");
  const capital = amount(k.lenderCapital);
  const exposure = a.existing + (a.recommended || a.requested);
  if (Number.isFinite(capital) && capital > 0 && exposure > 0) {
    const share = exposure / capital;
    note("concentration", share >= 0.05 ? "High" : share >= 0.02 ? "Medium" : "Low", `total exposure is ${(share * 100).toFixed(1)}% of the lender's capital${share >= 0.05 ? ", a big borrower" : ""}`);
  }

  // Operational risk.
  rated("operational", "operations");
  rated("operational", "environment");
  if (k.otherCollateral.some((o) => o.insured === "No")) note("operational", "Medium", "some assets are uninsured");

  // Legal and compliance risk.
  rated("legal", "compliance");
  if (k.buildings.some((b) => b.owner.trim() && k.borrower.trim() && bankKey(b.owner) !== bankKey(k.borrower))) note("legal", "Medium", "some collateral is owned by a third party");
  if (k.exceptions.trim()) note("legal", "Medium", "the request has exceptions to policy");

  // Strategic and market risk.
  rated("strategic", "market");
  rated("strategic", "management");
  if (L && Number.isFinite(L.salesGrowth)) note("strategic", L.salesGrowth < -0.1 ? "High" : L.salesGrowth < 0 ? "Medium" : "Low", `annualized sales ${L.salesGrowth >= 0 ? "up" : "down"} ${pctText(Math.abs(L.salesGrowth))}`);

  // Reputation and integrity risk.
  rated("reputation", "character");
  if (ob?.worst && !/pass/i.test(ob.worst) && ob.active.length) note("reputation", "High", `worst classification at other banks is ${ob.worst.toLowerCase()}`);

  // Collateral risk.
  if (Number.isFinite(a.coverRecommended)) {
    const fall = st("Lower property values");
    note("collateral", a.coverRecommended >= 1.25 ? "Low" : a.coverRecommended >= 1 ? "Medium" : "High", `collateral covers ${pctText(a.coverRecommended)} of exposure${fall ? `, ${pctText(fall.cover)} if values fall 30%` : ""}`);
  }
  // The highest level found sets the area's level; its reasons come first.
  const out: Partial<Record<RiskKey, { level: Level; why: string }>> = {};
  for (const [key, list] of Object.entries(parts) as [RiskKey, { level: Level; why: string }[]][]) {
    const sorted = [...list].sort((x, y) => levelOrder.indexOf(y.level) - levelOrder.indexOf(x.level));
    out[key] = { level: sorted.reduce<Level>((m, x) => higher(m, x.level), ""), why: sorted.map((x) => x.why).join("; ") };
  }
  return out;
}

/**
 * The points the procedure expects the analyst to have documented at origination,
 * checked against what is in the case.
 */
export function originationChecklist(k: CreditCase, a: CaseAnalysis) {
  const r = (q: QuestionKey) => !!k.assessment[q]?.rating;
  const insured = k.otherCollateral.every((o) => o.insured === "Yes");
  return [
    { point: "Purpose of the credit and source of repayment", done: !!k.purpose.trim() && (k.requests.some((x) => x.repayment.trim()) || r("plan")) },
    { point: "Integrity and reputation of the borrower", done: r("character") },
    { point: "Risk profile and sensitivity to economic and market developments", done: !!a.latest && (!!k.sectorReport || !!k.contextUpdate.trim()) },
    { point: "Repayment history and current capacity to repay", done: !!a.latest && (!!k.repaymentHistory.trim() || !!k.crb) },
    { point: "Forward-looking analysis under various scenarios", done: !!projection(k, a) },
    { point: "Legal capacity of the borrower to borrow", done: !!k.ownership && r("compliance") },
    { point: "Business expertise and position in the sector", done: r("management") && r("market") },
    { point: "Terms and conditions to limit future changes in risk", done: !!k.conditions.trim() },
    { point: "Adequacy and enforceability of collateral, registration and insurance", done: a.collateral > 0 && insured },
    { point: "Credit risk grade", done: !!k.gradeNow },
  ];
}

export type Scored = { criterion: string; result: string; verdict: "Meets" | "Watch" | "Concern" | "Not assessed" };

/** The decision scorecard: each test the figures and the analyst's answers support. */
export function scorecard(k: CreditCase, a: CaseAnalysis): Scored[] {
  const L = a.latest;
  const out: Scored[] = [];
  const add = (criterion: string, result: string, verdict: Scored["verdict"]) => out.push({ criterion, result, verdict });
  if (L) {
    add("Profitability", `Net margin ${Number.isFinite(L.npMargin) ? pctText(L.npMargin) : "-"}`, L.netProfit < 0 ? "Concern" : L.npMargin < 0.03 ? "Watch" : "Meets");
    if (Number.isFinite(L.currentRatio)) add("Liquidity", `Current ratio ${L.currentRatio.toFixed(2)}x`, L.currentRatio < 1 ? "Concern" : L.currentRatio < 1.2 ? "Watch" : "Meets");
    add("Leverage", L.tnw > 0 ? `Liabilities ${L.tlToTnw.toFixed(2)}x net worth` : "Negative net worth", L.tnw <= 0 || L.tlToTnw > 3 ? "Concern" : L.tlToTnw > 2 ? "Watch" : "Meets");
    if (Number.isFinite(L.interestCover)) add("Interest cover", `${L.interestCover.toFixed(2)}x`, L.interestCover < 1 ? "Concern" : L.interestCover < 2 ? "Watch" : "Meets");
    if (Number.isFinite(L.salesGrowth)) add("Sales trend", `${L.salesGrowth >= 0 ? "Up" : "Down"} ${pctText(Math.abs(L.salesGrowth))} annualized`, L.salesGrowth < -0.1 ? "Concern" : L.salesGrowth < 0 ? "Watch" : "Meets");
  } else add("Financial statements", "Not entered", "Not assessed");
  const proj = projection(k, a);
  if (proj) {
    const [b, , sev] = proj.scenarios;
    const dscr = (n: number) => (Number.isFinite(n) ? `${n.toFixed(2)}x` : "no debt service");
    add(
      "Repayment capacity (projection)",
      `Lowest debt service cover ${dscr(b.minDscr)} in the base case, ${dscr(sev.minDscr)} under severe stress`,
      b.result === "Shortfall" ? "Concern" : b.result === "Tight" || sev.result === "Shortfall" ? "Watch" : "Meets",
    );
  }
  const ap = k.project.has ? appraise(k.project) : null;
  if (ap) {
    const b = ap.base;
    if (Number.isFinite(b.irr)) add("Project return (IRR)", `${(b.irr * 100).toFixed(1)}% against ${(ap.discount * 100).toFixed(0)}% required`, b.irr < ap.discount ? "Concern" : b.irr < ap.discount + 0.03 ? "Watch" : "Meets");
    add("Project NPV", `ETB ${Math.round(b.npv).toLocaleString("en-US")}`, b.npv < 0 ? "Concern" : "Meets");
    if (Number.isFinite(b.minDscr)) add("Project debt service cover", `Lowest ${b.minDscr.toFixed(2)}x`, b.minDscr < 1 ? "Concern" : b.minDscr < 1.25 ? "Watch" : "Meets");
    if (Number.isFinite(ap.equityShare)) add("Equity contribution", `${(ap.equityShare * 100).toFixed(0)}% of the investment`, ap.equityShare < (Number(k.project.minEquity) || 25) / 100 ? "Watch" : "Meets");
  } else if (k.project.has) add("Project appraisal", "Client's projections not uploaded", "Not assessed");
  const combined = stressTests(k, a).find((x) => x.name === "Combined");
  if (combined) add("Stress test", `Combined scenario: ${combined.result.toLowerCase()}`, combined.result === "Fails" ? "Concern" : combined.result === "Weakens" ? "Watch" : "Meets");
  if (Number.isFinite(a.coverRecommended)) add("Collateral coverage", pctText(a.coverRecommended), a.coverRecommended < 1 ? "Concern" : a.coverRecommended < 1.25 ? "Watch" : "Meets");
  else add("Collateral coverage", "No collateral entered", "Not assessed");
  const ob = otherBanks(k);
  if (ob) add("Conduct at other banks", ob.inArrears ? `${ob.inArrears} facilit${ob.inArrears === 1 ? "y" : "ies"} in arrears` : ob.active.length ? "All facilities current" : "No active facilities", ob.inArrears ? "Concern" : "Meets");
  else add("Conduct at other banks", "No credit reference report", "Not assessed");
  if (k.facilities.length) {
    const bad = k.facilities.filter((f) => f.status !== "Pass").length;
    add("Present facilities with us", bad ? `${bad} not classified pass` : "All pass", bad ? "Concern" : "Meets");
  }
  const rated = questions.filter((q) => k.assessment[q.key]?.rating);
  const weak = rated.filter((q) => k.assessment[q.key]?.rating === "Weak");
  if (rated.length) add("Non-financial assessment", `${rated.length} of ${questions.length} areas rated, ${weak.length} weak`, weak.length >= 3 ? "Concern" : weak.length ? "Watch" : rated.length < questions.length ? "Watch" : "Meets");
  else add("Non-financial assessment", "Not completed", "Not assessed");
  return out;
}

export function overallVerdict(card: Scored[]) {
  const concerns = card.filter((c) => c.verdict === "Concern").length;
  const watch = card.filter((c) => c.verdict === "Watch").length;
  if (concerns === 0 && watch <= 1) return "Favorable";
  if (concerns <= 2) return "Favorable with conditions";
  return "Not favorable unless the concerns are mitigated";
}

/** SWOT built from the figures, the credit report, the analyst's ratings and the context. */
export function autoSwot(k: CreditCase, a: CaseAnalysis, ctxText: { opportunities: string[]; threats: string[] }) {
  const h = swotHints(k, a);
  const s = [...h.s];
  const w = [...h.w];
  for (const q of questions) {
    const r = k.assessment[q.key];
    if (r?.rating === "Strong") s.push(`${q.label}: ${r.note.trim() || "rated strong"}`.replace(/\.?$/, "."));
    if (r?.rating === "Weak") w.push(`${q.label}: ${r.note.trim() || "rated weak"}`.replace(/\.?$/, "."));
  }
  if (k.relationshipSince) {
    const years = Math.floor((Date.now() - Date.parse(k.relationshipSince)) / (365.25 * 864e5));
    if (years >= 3) s.push(`Banking relationship of ${years} years.`);
  }
  return { s, w, o: ctxText.opportunities, t: ctxText.threats };
}
