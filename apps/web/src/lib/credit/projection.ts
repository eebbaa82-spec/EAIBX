import { amount, type CaseAnalysis, type CreditCase } from "./case";

/**
 * Cash flow projection over the life of the proposed facilities, year by year,
 * from the latest period's figures and the analyst's assumptions. Repayment
 * capacity is tested under three scenarios: base, moderate and severe stress.
 */

export type ProjectionInput = { growth: string; margin: string; opex: string; tax: string; rate: string; capex: string };
export const emptyProjection = (): ProjectionInput => ({ growth: "", margin: "", opex: "", tax: "", rate: "", capex: "" });

export type Assumptions = { growth: number; margin: number; opex: number; tax: number; rate: number; capex: number; wc: number; dep: number };
export type YearRow = {
  year: number;
  sales: number;
  ebitda: number;
  tax: number;
  wcChange: number;
  capex: number;
  cfads: number;
  interest: number;
  principal: number;
  debtService: number;
  dscr: number;
  netCash: number;
  cash: number;
};
export type Scenario = { key: "base" | "moderate" | "severe"; name: string; shock: string; rows: YearRow[]; minDscr: number; avgDscr: number; shortYears: number; result: "Comfortable" | "Tight" | "Shortfall" };

const unitScale: Record<string, number> = { "ETB '000": 1000, ETB: 1, "ETB million": 1000000 };
const pct = (v: string) => (v.trim() === "" || !Number.isFinite(Number(v)) ? NaN : Number(v) / 100);
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const revolving = (type: string) => /overdraft|revolving|merchandise|pre-shipment|working capital/i.test(type);
const offBalance = (type: string) => /letter of (credit|guarantee)|guarantee|l\/c/i.test(type);

/** Defaults from the latest period, each overridden by the analyst's own figure. */
export function assumptions(k: CreditCase, a: CaseAnalysis): Assumptions | null {
  const L = a.latest;
  if (!L || !(L.sales > 0)) return null;
  const year = 365 / (L.days || 365);
  const p = k.projection;
  const auto = {
    growth: Number.isFinite(L.salesGrowth) ? clamp(L.salesGrowth, -0.05, 0.15) : 0.05,
    margin: (L.grossProfit + L.directDep) / L.sales,
    opex: (L.admin + L.remuneration) / L.sales,
    tax: 0.3,
    rate: 0.16,
    dep: (L.depreciation + L.amortization + L.directDep) * year,
  };
  const recRate = k.recommendations.map((r) => amount(r.rate)).find((n) => Number.isFinite(n) && n > 0);
  const pick = (v: string, fallback: number) => (Number.isFinite(pct(v)) ? pct(v) : fallback);
  const wc = (L.stock + L.tradeDebtors + L.otherDebtors - L.tradeCreditors - L.otherCreditors) / (L.sales * year);
  return {
    growth: pick(p.growth, auto.growth),
    margin: pick(p.margin, auto.margin),
    opex: pick(p.opex, auto.opex),
    tax: pick(p.tax, auto.tax),
    rate: pick(p.rate, recRate ? recRate / 100 : auto.rate),
    capex: Number.isFinite(amount(p.capex)) && p.capex.trim() !== "" ? amount(p.capex) : auto.dep,
    wc: Number.isFinite(wc) ? Math.max(0, wc) : 0,
    dep: auto.dep,
  };
}

/** The facilities the projection repays: the recommendation, else the request. */
function facilities(k: CreditCase, scale: number) {
  const recs = k.recommendations.filter((r) => amount(r.amount) > 0).map((r) => ({ type: r.type, amount: amount(r.amount) / scale, months: amount(r.tenure), rate: amount(r.rate) }));
  if (recs.length) return recs;
  return k.requests.filter((r) => amount(r.amount) > 0).map((r) => ({ type: r.type, amount: amount(r.amount) / scale, months: amount(r.tenor), rate: NaN }));
}

export function projectionYears(k: CreditCase) {
  const f = facilities(k, 1);
  const months = Math.max(12, ...f.map((x) => (Number.isFinite(x.months) ? x.months : 12)));
  return Math.min(10, Math.ceil(months / 12));
}

export function projection(k: CreditCase, a: CaseAnalysis): { input: Assumptions; years: number; scenarios: Scenario[] } | null {
  const L = a.latest;
  const base = assumptions(k, a);
  if (!L || !base) return null;
  const scale = unitScale[k.unit] ?? 1000;
  const yearFactor = 365 / (L.days || 365);
  const loans = facilities(k, scale).filter((f) => !offBalance(f.type));
  const years = projectionYears(k);
  const sales0 = L.sales * yearFactor;
  const existingInterest = L.finExp * yearFactor;
  const existingDebt = L.currentPortion + L.ltLoans;

  const run = (key: Scenario["key"], name: string, shock: string, salesCut: number, marginCut: number, rateUp: number): Scenario => {
    const rows: YearRow[] = [];
    let prevSales = sales0;
    let cash = L.cash;
    let oldDebt = existingDebt;
    const balances = loans.map((f) => f.amount);
    for (let y = 1; y <= years; y++) {
      const baseSales = sales0 * Math.pow(1 + base.growth, y);
      const sales = baseSales * (1 - salesCut);
      // A stress never improves on the base case, even for a loss-making business.
      const ebitda = Math.min(sales * (base.margin - marginCut) - sales * base.opex, baseSales * base.margin - baseSales * base.opex);
      // Existing loans: the current portion falls due each year until they are repaid.
      const oldPrincipal = Math.min(oldDebt, L.currentPortion > 0 ? L.currentPortion : 0);
      const oldInterest = existingDebt > 0 ? existingInterest * (oldDebt / existingDebt) + oldDebt * rateUp : existingInterest;
      oldDebt -= oldPrincipal;
      let newInterest = 0;
      let newPrincipal = 0;
      loans.forEach((f, i) => {
        const rate = (Number.isFinite(f.rate) && f.rate > 0 ? f.rate / 100 : base.rate) + rateUp;
        newInterest += balances[i] * rate;
        if (revolving(f.type)) return; // renewed each year; interest only
        const term = Math.max(1, Math.ceil((Number.isFinite(f.months) && f.months > 0 ? f.months : 12) / 12));
        const due = y <= term ? Math.min(balances[i], f.amount / term) : 0;
        newPrincipal += due;
        balances[i] -= due;
      });
      const interest = oldInterest + newInterest;
      const principal = oldPrincipal + newPrincipal;
      const tax = Math.max(0, ebitda - base.dep - interest) * base.tax;
      const wcChange = base.wc * (sales - prevSales);
      const cfads = ebitda - tax - wcChange - base.capex;
      const debtService = interest + principal;
      const netCash = cfads - debtService;
      cash += netCash;
      rows.push({ year: y, sales, ebitda, tax, wcChange, capex: base.capex, cfads, interest, principal, debtService, dscr: debtService > 0 ? cfads / debtService : NaN, netCash, cash });
      prevSales = sales;
    }
    const d = rows.map((r) => r.dscr).filter(Number.isFinite);
    const minDscr = d.length ? Math.min(...d) : NaN;
    const avgDscr = d.length ? d.reduce((s, x) => s + x, 0) / d.length : NaN;
    const shortYears = rows.filter((r) => Number.isFinite(r.dscr) && r.dscr < 1).length;
    const result = !Number.isFinite(minDscr) || minDscr >= 1.25 ? "Comfortable" : minDscr >= 1 ? "Tight" : "Shortfall";
    return { key, name, shock, rows, minDscr, avgDscr, shortYears, result };
  };

  return {
    input: base,
    years,
    scenarios: [
      run("base", "Base case", "The assumptions as set", 0, 0, 0),
      run("moderate", "Moderate stress", "Sales 10% below the base case and gross margin 2 points lower", 0.1, 0.02, 0),
      run("severe", "Severe stress", "Sales 20% below the base case, gross margin 4 points lower and interest rates 3 points higher", 0.2, 0.04, 0.03),
    ],
  };
}
