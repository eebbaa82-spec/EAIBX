/**
 * Project appraisal for requests that finance a new project, an expansion or a
 * business plan: facts read from the feasibility study, the client's projected
 * figures for the study period, and the appraisal itself (investment and
 * financing, NPV, IRR, payback, debt service cover and sensitivity).
 */

export type ProjKey = "revenue" | "opCost" | "depreciation" | "interest" | "tax" | "netProfit" | "investment" | "workingCapital" | "principal" | "netCashFlow";

export const projLines: { key: ProjKey; label: string; re: RegExp }[] = [
  { key: "revenue", label: "Revenue", re: /^(total )?(revenue|sales|turnover|income from sales)|sales revenue|gross revenue/i },
  { key: "opCost", label: "Cash operating costs", re: /operating cost|production cost|cost of (sales|production|goods)|total (cash )?(cost|expense)|operating expense|variable cost/i },
  { key: "depreciation", label: "Depreciation", re: /depreciation|amorti[sz]ation/i },
  { key: "interest", label: "Interest", re: /interest|finance cost|financial cost/i },
  { key: "tax", label: "Profit tax", re: /(income|profit|business) tax|tax expense|^tax/i },
  { key: "netProfit", label: "Net profit", re: /net (profit|income)|profit after tax|net (loss|earning)/i },
  { key: "investment", label: "Investment (capital expenditure)", re: /investment cost|initial investment|capital (expenditure|investment|cost)|fixed investment|capex|^investment/i },
  { key: "workingCapital", label: "Working capital investment", re: /working capital/i },
  { key: "principal", label: "Loan principal repayment", re: /principal|loan repayment|repayment of loan|debt repayment/i },
  { key: "netCashFlow", label: "Net cash flow", re: /net cash ?flow|cash flow after|free cash flow/i },
];

/** Matching order: the most specific names first ("net profit after interest" is net profit, not interest). */
export const matchOrder: ProjKey[] = ["netCashFlow", "netProfit", "workingCapital", "investment", "principal", "revenue", "opCost", "depreciation", "interest", "tax"];

export type Projections = { file: string; years: string[]; lines: Partial<Record<ProjKey, (number | null)[]>>; labels: Partial<Record<ProjKey, string>> };
export type StudyFact = { key: string; label: string; value: string; snippet: string };
export type InvestmentItem = { item: string; amount: string };

export type ProjectInput = {
  has: boolean;
  studyName: string;
  facts: StudyFact[];
  name: string;
  description: string;
  location: string;
  capacity: string;
  products: string;
  employment: string;
  schedule: string;
  investment: InvestmentItem[];
  equity: string;
  loan: string;
  rate: string;
  tenure: string;
  grace: string;
  life: string;
  discount: string;
  minEquity: string;
  scale: string;
  projections: Projections | null;
  market: string;
  technical: string;
  environment: string;
  assumptions: string;
};

export const emptyProject = (): ProjectInput => ({
  has: false,
  studyName: "",
  facts: [],
  name: "",
  description: "",
  location: "",
  capacity: "",
  products: "",
  employment: "",
  schedule: "",
  investment: ["Land and site development", "Buildings and civil works", "Machinery and equipment", "Vehicles", "Pre-operating expenses", "Initial working capital"].map((item) => ({ item, amount: "" })),
  equity: "",
  loan: "",
  rate: "",
  tenure: "",
  grace: "",
  life: "",
  discount: "",
  minEquity: "25",
  scale: "1",
  projections: null,
  market: "",
  technical: "",
  environment: "",
  assumptions: "",
});

const num = (v: string) => {
  const n = Number(String(v ?? "").replace(/[,\s]/g, ""));
  return v?.trim() && Number.isFinite(n) ? n : NaN;
};

/* ---------- Reading the study ---------- */

const money = String.raw`(?:birr|etb|br\.?)?\s*([\d][\d,]*(?:\.\d+)?)\s*(million|mn|m\b|billion|bn)?\s*(?:birr|etb|br\.?)?`;
const amountOf = (n: string, unit?: string) => {
  const v = Number(n.replace(/,/g, ""));
  const f = /^b/i.test(unit ?? "") ? 1e9 : /^m/i.test(unit ?? "") ? 1e6 : 1;
  return Number.isFinite(v) ? Math.round(v * f) : NaN;
};

const factRules: { key: string; label: string; re: RegExp; kind: "money" | "pct" | "years" | "count" | "text" }[] = [
  { key: "investment", label: "Total investment cost", re: new RegExp(String.raw`total (?:project |investment |initial |capital )?(?:cost|investment|capital requirement|outlay)[^.\n\d]{0,60}?${money}`, "i"), kind: "money" },
  { key: "equity", label: "Equity contribution", re: new RegExp(String.raw`(?:equity|own contribution|promoter'?s? contribution|owners'? contribution)[^.\n\d]{0,60}?${money}`, "i"), kind: "money" },
  { key: "loan", label: "Loan requested", re: new RegExp(String.raw`(?:bank loan|loan (?:amount|requested|required|finance)|debt finance|credit (?:requested|required))[^.\n\d]{0,60}?${money}`, "i"), kind: "money" },
  { key: "irr", label: "IRR stated in the study", re: /(?:\birr\b|internal rate of return)[^.\n\d]{0,40}?([\d.]+)\s*%/i, kind: "pct" },
  { key: "npv", label: "NPV stated in the study", re: new RegExp(String.raw`(?:\bnpv\b|net present value)[^.\n\d]{0,60}?${money}`, "i"), kind: "money" },
  { key: "payback", label: "Payback period stated", re: /pay\s?-?back(?: period)?[^.\n\d]{0,40}?([\d.]+)\s*years?/i, kind: "years" },
  { key: "life", label: "Project life", re: /(?:project|economic|useful|service) life[^.\n\d]{0,30}?(\d{1,2})\s*years/i, kind: "years" },
  { key: "employment", label: "Employment", re: /(\d[\d,]*)\s*(?:permanent |temporary |direct )?(?:employees|jobs|workers|staff|job opportunities)/i, kind: "count" },
  { key: "capacity", label: "Capacity", re: /((?:annual|installed|production|plant|rated) capacity[^.\n]{3,120})/i, kind: "text" },
  { key: "location", label: "Location", re: /(?:located|situated|location)\s*(?:at|in|:)\s*([^.\n]{3,80})/i, kind: "text" },
  { key: "products", label: "Products or services", re: /(?:main products?|products? (?:include|are)|the project (?:will )?produces?|services? (?:include|are))\s*:?\s*([^.\n]{5,140})/i, kind: "text" },
  { key: "schedule", label: "Implementation period", re: /((?:construction|implementation|installation|erection) (?:period|time|schedule)[^.\n]{3,80})/i, kind: "text" },
  { key: "discount", label: "Discount rate used", re: /discount(?:ed|ing)? (?:rate|factor)[^.\n\d]{0,30}?([\d.]+)\s*%/i, kind: "pct" },
];

/** Key facts found in the text of a feasibility study or business plan, each with the sentence it came from. */
export function studyFacts(text: string): StudyFact[] {
  // Sentences run across line breaks in PDFs: read the text as one flow.
  const flat = text.replace(/[’‘]/g, "'").replace(/\s+/g, " ");
  const out: StudyFact[] = [];
  for (const r of factRules) {
    const m = flat.match(r.re);
    if (!m) continue;
    const at = m.index ?? 0;
    const snippet = flat.slice(Math.max(0, at - 40), at + m[0].length + 40).replace(/\s+/g, " ").trim();
    let value = "";
    if (r.kind === "money") {
      const v = amountOf(m[1], m[2]);
      if (!Number.isFinite(v) || v < 1000) continue;
      value = String(v);
    } else if (r.kind === "pct" || r.kind === "years") value = m[1];
    else if (r.kind === "count") value = m[1].replace(/,/g, "");
    else value = m[1].trim().replace(/\s+/g, " ");
    out.push({ key: r.key, label: r.label, value, snippet });
  }
  return out;
}

/* ---------- Appraisal ---------- */

export type YearCash = { year: string; revenue: number; ebitda: number; tax: number; netProfit: number; investment: number; fcf: number; interest: number; principal: number; dscr: number };
export type Viability = { npv: number; irr: number; payback: number; minDscr: number; avgDscr: number };
export type Appraisal = {
  totalInvestment: number;
  equity: number;
  loan: number;
  equityShare: number;
  discount: number;
  life: number;
  years: YearCash[];
  base: Viability;
  sensitivity: { name: string; v: Viability }[];
  verdict: "Viable" | "Viable with conditions" | "Not viable as presented";
  reasons: string[];
};

export function npv(rate: number, flows: number[]) {
  return flows.reduce((s, f, t) => s + f / Math.pow(1 + rate, t), 0);
}
export function irr(flows: number[]) {
  if (!flows.some((f) => f < 0) || !flows.some((f) => f > 0)) return NaN;
  let lo = -0.99;
  let hi = 5;
  if (npv(lo, flows) * npv(hi, flows) > 0) return NaN;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (npv(lo, flows) * npv(mid, flows) <= 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}
function payback(flows: number[]) {
  let cum = 0;
  for (let t = 0; t < flows.length; t++) {
    const prev = cum;
    cum += flows[t];
    if (t > 0 && cum >= 0 && prev < 0) return t - 1 + -prev / flows[t];
  }
  return NaN;
}

/**
 * The appraisal, in birr. Year 0 carries the investment; the client's projected
 * years follow. Where the client gives no investment line, the investment table
 * is spent in year 0. Debt service follows the loan's terms unless the client's
 * figures give the principal repayments.
 */
export function appraise(p: ProjectInput): Appraisal | null {
  const pr = p.projections;
  if (!pr || !pr.years.length) return null;
  const scale = num(p.scale) || 1;
  const line = (k: ProjKey) => pr.lines[k]?.map((v) => (v === null ? 0 : v * scale)) ?? null;
  const at = (arr: number[] | null, i: number) => (arr ? (arr[i] ?? 0) : 0);
  const revenue = line("revenue");
  const opCost = line("opCost");
  const dep = line("depreciation");
  const interestIn = line("interest");
  const taxIn = line("tax");
  const profit = line("netProfit");
  const invest = line("investment");
  const wc = line("workingCapital");
  const principalIn = line("principal");

  // Year 0 is a column headed 0 (or "Year 0"); otherwise the investment table is spent before year 1.
  const zeroCol = pr.years.findIndex((y) => /(^|\D)0$/.test(y.trim()));
  const tableInvestment = p.investment.reduce((s, x) => s + (Number.isFinite(num(x.amount)) ? num(x.amount) : 0), 0);
  const projInvestment = invest ? invest.reduce((s, v) => s + Math.abs(v), 0) : 0;
  const totalInvestment = tableInvestment || projInvestment;
  const equity = num(p.equity);
  const loan = Number.isFinite(num(p.loan)) ? num(p.loan) : Number.isFinite(equity) ? Math.max(0, totalInvestment - equity) : NaN;
  const eq = Number.isFinite(equity) ? equity : Number.isFinite(loan) ? Math.max(0, totalInvestment - loan) : NaN;
  const rate = (Number.isFinite(num(p.rate)) ? num(p.rate) : 16) / 100;
  const tenure = Math.max(1, Math.round(Number.isFinite(num(p.tenure)) ? num(p.tenure) : 5));
  const grace = Math.max(0, Math.min(tenure - 1, Math.round(Number.isFinite(num(p.grace)) ? num(p.grace) : 0)));
  const discount = (Number.isFinite(num(p.discount)) ? num(p.discount) : 18) / 100;

  // Loan schedule by operating year: interest on the balance, equal principal after the grace period.
  const balance = Number.isFinite(loan) ? loan : 0;
  // The investment table, when filled, is the investment, spent in year 0; otherwise the client's investment line is used year by year.
  const useTable = tableInvestment > 0;
  const ops = pr.years.map((_, i) => i).filter((i) => i !== zeroCol);

  const build = (revF: number, costF: number, invF: number) => {
    const years: YearCash[] = [];
    let bal = balance;
    const flows: number[] = [];
    const year0 = useTable ? tableInvestment : zeroCol >= 0 ? Math.abs(at(invest, zeroCol)) : 0;
    flows.push(-year0 * invF);
    ops.forEach((i, k) => {
      const rev = at(revenue, i) * revF;
      const cost = at(opCost, i) * costF;
      const d = at(dep, i);
      // Operating cash profit: revenue less cash costs, or rebuilt from net profit.
      const ebitdaBase = revenue && opCost ? at(revenue, i) - at(opCost, i) : at(profit, i) + d + at(interestIn, i) + at(taxIn, i);
      const ebitda = revenue && opCost ? rev - cost : ebitdaBase + at(revenue, i) * (revF - 1) - at(opCost, i) * (costF - 1);
      const interest = interestIn && at(interestIn, i) > 0 ? at(interestIn, i) : bal * rate;
      const due = principalIn ? Math.abs(at(principalIn, i)) : k >= grace && k < tenure ? Math.min(bal, (Number.isFinite(loan) ? loan : 0) / (tenure - grace)) : 0;
      bal = Math.max(0, bal - due);
      const tax = taxIn && revF === 1 && costF === 1 ? Math.abs(at(taxIn, i)) : Math.max(0, ebitda - d - interest) * 0.3;
      const netProfit = ebitda - d - interest - tax;
      const capex = invest && !useTable ? Math.abs(at(invest, i)) * invF : 0;
      const wcInv = wc ? at(wc, i) : 0;
      // Project cash flow, before financing: operating cash profit after tax, less investment.
      const fcf = ebitda - Math.max(0, ebitda - d) * 0.3 - capex - wcInv;
      flows.push(fcf);
      const ds = interest + due;
      years.push({ year: pr.years[i], revenue: rev, ebitda, tax, netProfit, investment: capex + wcInv, fcf, interest, principal: due, dscr: ds > 0 ? (ebitda - tax) / ds : NaN });
    });
    const d = years.map((y) => y.dscr).filter(Number.isFinite);
    const v: Viability = { npv: npv(discount, flows), irr: irr(flows), payback: payback(flows), minDscr: d.length ? Math.min(...d) : NaN, avgDscr: d.length ? d.reduce((s, x) => s + x, 0) / d.length : NaN };
    return { years, v };
  };

  const base = build(1, 1, 1);
  const sensitivity = [
    { name: "Revenue 10% lower", v: build(0.9, 1, 1).v },
    { name: "Operating costs 10% higher", v: build(1, 1.1, 1).v },
    { name: "Investment cost 10% higher", v: build(1, 1, 1.1).v },
    { name: "Revenue 10% lower and costs 10% higher", v: build(0.9, 1.1, 1).v },
  ];

  const equityShare = totalInvestment > 0 && Number.isFinite(eq) ? eq / totalInvestment : NaN;
  const minEquity = (Number.isFinite(num(p.minEquity)) ? num(p.minEquity) : 25) / 100;
  const reasons: string[] = [];
  let fails = 0;
  let watch = 0;
  const b = base.v;
  if (Number.isFinite(b.npv)) {
    if (b.npv < 0) fails++;
    reasons.push(b.npv >= 0 ? `NPV is positive at a ${(discount * 100).toFixed(0)}% discount rate.` : `NPV is negative at a ${(discount * 100).toFixed(0)}% discount rate.`);
  }
  if (Number.isFinite(b.irr)) {
    if (b.irr < discount) fails++;
    reasons.push(`IRR of ${(b.irr * 100).toFixed(1)}% is ${b.irr >= discount ? "above" : "below"} the ${(discount * 100).toFixed(0)}% required return.`);
  }
  if (Number.isFinite(b.minDscr)) {
    if (b.minDscr < 1) fails++;
    else if (b.minDscr < 1.25) watch++;
    reasons.push(`Lowest debt service cover is ${b.minDscr.toFixed(2)}x.`);
  }
  if (Number.isFinite(equityShare)) {
    if (equityShare < minEquity) watch++;
    reasons.push(`Equity is ${(equityShare * 100).toFixed(0)}% of the investment, against ${(minEquity * 100).toFixed(0)}% required.`);
  }
  const worst = sensitivity.reduce((m, s) => Math.min(m, Number.isFinite(s.v.minDscr) ? s.v.minDscr : Infinity), Infinity);
  if (worst < 1) {
    watch++;
    reasons.push(`Debt service cover falls below 1.00x in at least one sensitivity case.`);
  }
  const verdict = fails ? "Not viable as presented" : watch ? "Viable with conditions" : "Viable";
  return { totalInvestment, equity: eq, loan, equityShare, discount, life: num(p.life), years: base.years, base: b, sensitivity, verdict, reasons };
}
