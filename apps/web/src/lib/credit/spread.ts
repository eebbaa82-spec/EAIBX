/**
 * Financial statement spread for the credit analysis workspace. It follows the
 * lender's "Financial Analysis Form" workbook line by line: five periods, newest
 * first (column B in the workbook), oldest last (column F). Every formula below
 * names the workbook row it reproduces.
 *
 * Two deliberate departures from the sample workbook, both noted in the UI:
 * - Opening fixed assets come from the next older period (the sample pointed one
 *   column the wrong way), and assets sold is its own entry rather than the loss
 *   on disposal.
 * - Bank debt is short loans + current portion + long/medium loans (rows 20, 21,
 *   31); the sample summed trade creditors (row 22) instead of row 21.
 */

export const PERIODS = 5;

export type LineId =
  | "landBuilding" | "machinery" | "otherFixed"
  | "cash" | "stock" | "tradeDebtors" | "otherDebtors" | "interCoDebtors" | "otherCurrent"
  | "shortLoans" | "currentPortion" | "tradeCreditors" | "otherCreditors" | "interCoCreditors" | "currentTaxes" | "dividendsPayable" | "otherCurrentLiab"
  | "ltLoans" | "deferredTax" | "shareholderLoans" | "interCoLoans" | "otherLtCreditors" | "grants"
  | "capital" | "reserves" | "retained" | "otherEquity"
  | "sales" | "cogs" | "directDep" | "otherDirect"
  | "admin" | "depreciation" | "amortization" | "remuneration"
  | "finExp" | "lossDisposal" | "otherExp"
  | "interestIncome" | "otherIncome"
  | "tax" | "extraordinary" | "dividendsPaid"
  | "assetsSold" | "revaluation";

export type LineGroup = { title: string; lines: { id: LineId; label: string }[]; total?: { key: TotalKey; label: string }[] };

export const balanceSheet: LineGroup[] = [
  {
    title: "Fixed assets",
    lines: [
      { id: "landBuilding", label: "Land and building" },
      { id: "machinery", label: "Machinery and vehicles" },
      { id: "otherFixed", label: "Other fixed assets" },
    ],
    total: [{ key: "fixedAssets", label: "Fixed assets" }],
  },
  {
    title: "Current assets",
    lines: [
      { id: "cash", label: "Cash on hand and in bank" },
      { id: "stock", label: "Stock and work in process" },
      { id: "tradeDebtors", label: "Trade debtors" },
      { id: "otherDebtors", label: "Other debtors and prepayments" },
      { id: "interCoDebtors", label: "Inter-company debtors" },
      { id: "otherCurrent", label: "Others" },
    ],
    total: [{ key: "currentAssets", label: "Current assets" }],
  },
  {
    title: "Current liabilities",
    lines: [
      { id: "shortLoans", label: "Short loans (short term loan and overdraft)" },
      { id: "currentPortion", label: "Current portion of long/medium loans" },
      { id: "tradeCreditors", label: "Trade creditors" },
      { id: "otherCreditors", label: "Other creditors and accruals" },
      { id: "interCoCreditors", label: "Inter-company creditors" },
      { id: "currentTaxes", label: "Current taxes" },
      { id: "dividendsPayable", label: "Dividends" },
      { id: "otherCurrentLiab", label: "Others" },
    ],
    total: [
      { key: "currentLiab", label: "Current liabilities" },
      { key: "netCurrentAssets", label: "Net current assets" },
      { key: "employment", label: "Employment of capital" },
    ],
  },
  {
    title: "Term liabilities",
    lines: [
      { id: "ltLoans", label: "Long/medium term loans" },
      { id: "deferredTax", label: "Deferred tax" },
      { id: "shareholderLoans", label: "Shareholders' loans" },
      { id: "interCoLoans", label: "Inter-company loans" },
      { id: "otherLtCreditors", label: "Other long term creditors" },
      { id: "grants", label: "Grants" },
    ],
    total: [{ key: "termLiab", label: "Term liabilities" }],
  },
  {
    title: "Net worth",
    lines: [
      { id: "capital", label: "Capital (paid-up/initial)" },
      { id: "reserves", label: "Reserves" },
      { id: "retained", label: "Retained earnings" },
      { id: "otherEquity", label: "Others" },
    ],
    total: [
      { key: "tnw", label: "Tangible net worth" },
      { key: "capitalEmployed", label: "Capital employed" },
      { key: "check", label: "Check: total assets less total liabilities (should be 0)" },
    ],
  },
];

export const profitLoss: LineGroup[] = [
  {
    title: "Trading",
    lines: [
      { id: "sales", label: "Net sales" },
      { id: "cogs", label: "Cost of goods sold" },
      { id: "directDep", label: "Direct depreciation" },
      { id: "otherDirect", label: "Other direct costs" },
    ],
    total: [{ key: "grossProfit", label: "Gross profit" }],
  },
  {
    title: "Operating expenses",
    lines: [
      { id: "admin", label: "Administrative and general expenses" },
      { id: "depreciation", label: "Depreciation" },
      { id: "amortization", label: "Amortization" },
      { id: "remuneration", label: "Direct remunerations" },
    ],
    total: [{ key: "operatingProfit", label: "Operating profit" }],
  },
  {
    title: "Other expenses and income",
    lines: [
      { id: "finExp", label: "Financial expenses" },
      { id: "lossDisposal", label: "Loss on disposal of fixed assets" },
      { id: "otherExp", label: "Other expenses" },
      { id: "interestIncome", label: "Interest income" },
      { id: "otherIncome", label: "Other income" },
    ],
    total: [{ key: "pbt", label: "Profit/(loss) before tax" }],
  },
  {
    title: "Tax and appropriation",
    lines: [
      { id: "tax", label: "Tax expense/(credit)" },
      { id: "extraordinary", label: "Extraordinary (gain)/loss" },
      { id: "dividendsPaid", label: "Dividends/drawings" },
    ],
    total: [
      { key: "netProfit", label: "Net profit/(loss) after tax" },
      { key: "toReserves", label: "To reserves" },
    ],
  },
];

export const reconciliationLines: { id: LineId; label: string }[] = [
  { id: "assetsSold", label: "Book value of fixed assets sold" },
  { id: "revaluation", label: "Revaluations" },
];

export type Period = { date: string; days: string; type: "Audited" | "Interim" | "Provisional" | "Projected" | "" };
export type SpreadInput = { periods: Period[]; values: Partial<Record<LineId, string[]>> };

export type TotalKey =
  | "fixedAssets" | "currentAssets" | "currentLiab" | "netCurrentAssets" | "employment" | "termLiab" | "tnw" | "capitalEmployed" | "check"
  | "grossProfit" | "operatingProfit" | "pbt" | "netProfit" | "toReserves";

export type Column = Record<LineId | TotalKey, number> & {
  filled: boolean;
  days: number;
  date: string;
  type: string;
  totalAssets: number;
  totalLiab: number;
  bankDebt: number;
  // reconciliation (row 90 to 95)
  openingFA: number;
  depTotal: number;
  capex: number;
  // ratios (rows 123 to 147); NaN where the period gives no basis
  salesGrowth: number;
  gpMargin: number;
  npMargin: number;
  roe: number;
  currentRatio: number;
  quickRatio: number;
  stockDays: number;
  debtorDays: number;
  creditorDays: number;
  wcCycle: number;
  wcPerBirr: number;
  wcStock: number;
  wcDebtors: number;
  wcCreditors: number;
  wcTotal: number;
  tlToTnw: number;
  bankDebtToTnw: number;
  tlToTa: number;
  interestCover: number;
  trend: Partial<Record<"fixedAssets" | "currentAssets" | "stock" | "debtors" | "currentLiab" | "tnw" | "sales" | "pbt", number>>;
};

export const num = (v: string | undefined) => {
  if (v == null) return 0;
  const s = String(v).replace(/[,\s]/g, "");
  if (s === "" || s === "-") return 0;
  // Accounting brackets mean a negative figure.
  const neg = /^\(.*\)$/.test(s);
  const n = Number(s.replace(/[()]/g, ""));
  return Number.isFinite(n) ? (neg ? -n : n) : 0;
};

const div = (a: number, b: number) => (b === 0 ? NaN : a / b);

export function daysBetween(newer: string, older: string) {
  const a = Date.parse(newer);
  const b = Date.parse(older);
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
  return Math.round((a - b) / 864e5);
}

/** Period length: the analyst's entry, else the gap to the next older date, else 365. */
export function periodDays(periods: Period[], i: number) {
  const typed = Number(periods[i]?.days);
  if (periods[i]?.days && Number.isFinite(typed) && typed > 0) return typed;
  const gap = periods[i + 1] ? daysBetween(periods[i].date, periods[i + 1].date) : NaN;
  return gap > 0 ? gap : 365;
}

export function computeSpread(input: SpreadInput): Column[] {
  const v = (id: LineId, i: number) => num(input.values[id]?.[i]);
  const cols: Column[] = [];
  for (let i = 0; i < PERIODS; i++) {
    const c = {} as Column;
    const ids = Object.keys(input.values) as LineId[];
    for (const id of ids) c[id] = v(id, i);
    for (const g of [...balanceSheet, ...profitLoss]) for (const l of g.lines) c[l.id] = v(l.id, i);
    for (const l of reconciliationLines) c[l.id] = v(l.id, i);
    c.filled = !!input.periods[i]?.date || ids.some((id) => (input.values[id]?.[i] ?? "").trim() !== "");
    c.date = input.periods[i]?.date ?? "";
    c.type = input.periods[i]?.type ?? "";
    c.days = periodDays(input.periods, i);

    c.fixedAssets = c.landBuilding + c.machinery + c.otherFixed; // row 12
    c.currentAssets = c.cash + c.stock + c.tradeDebtors + c.otherDebtors + c.interCoDebtors + c.otherCurrent; // row 19
    c.currentLiab = c.shortLoans + c.currentPortion + c.tradeCreditors + c.otherCreditors + c.interCoCreditors + c.currentTaxes + c.dividendsPayable + c.otherCurrentLiab; // row 28
    c.netCurrentAssets = c.currentAssets - c.currentLiab; // row 29
    c.employment = c.fixedAssets + c.currentAssets - c.currentLiab; // row 30
    c.termLiab = c.ltLoans + c.deferredTax + c.shareholderLoans + c.interCoLoans + c.otherLtCreditors + c.grants; // row 37
    c.tnw = c.capital + c.reserves + c.retained + c.otherEquity; // row 42
    c.capitalEmployed = c.termLiab + c.tnw; // row 43
    c.check = c.employment - c.capitalEmployed; // row 44

    c.grossProfit = c.sales - c.cogs - c.directDep - c.otherDirect; // row 64
    c.operatingProfit = c.grossProfit - c.admin - c.depreciation - c.amortization - c.remuneration; // row 69
    c.pbt = c.operatingProfit - (c.finExp + c.lossDisposal + c.otherExp) + (c.interestIncome + c.otherIncome); // row 77
    c.netProfit = c.pbt - c.tax - c.extraordinary; // row 81
    c.toReserves = c.netProfit - c.dividendsPaid; // row 83

    c.totalAssets = c.fixedAssets + c.currentAssets; // row 144
    c.totalLiab = c.currentLiab + c.termLiab;
    c.bankDebt = c.shortLoans + c.currentPortion + c.ltLoans;
    cols.push(c);
  }

  // Trend ratios (rows 110 to 117) index each period to the oldest filled one.
  const base = [...cols].reverse().find((c) => c.filled);
  const trendOf = (c: Column) => ({
    fixedAssets: c.fixedAssets,
    currentAssets: c.currentAssets,
    stock: c.stock,
    debtors: c.tradeDebtors + c.otherDebtors + c.interCoDebtors,
    currentLiab: c.currentLiab,
    tnw: c.tnw,
    sales: c.sales,
    pbt: c.pbt,
  });

  cols.forEach((c, i) => {
    const prev = cols.slice(i + 1).find((p) => p.filled);
    const costBase = c.cogs + c.directDep + c.otherDirect;

    // Fixed asset reconciliation (rows 90 to 95).
    c.depTotal = c.directDep + c.depreciation;
    c.openingFA = prev ? prev.fixedAssets : NaN;
    c.capex = prev ? c.fixedAssets - (prev.fixedAssets - c.depTotal - c.assetsSold + c.revaluation) : NaN;

    // Row 123: growth of annualized sales over the previous period.
    c.salesGrowth = prev && prev.sales !== 0 && c.sales !== 0 ? div(c.sales * 365 / c.days - prev.sales * 365 / prev.days, prev.sales * 365 / prev.days) : NaN;
    c.gpMargin = c.sales !== 0 && costBase !== 0 ? c.grossProfit / c.sales : NaN; // row 124
    c.npMargin = div(c.netProfit, c.sales); // row 125
    c.roe = div(c.netProfit, c.tnw); // row 126
    c.currentRatio = div(c.currentAssets, c.currentLiab); // row 128
    c.quickRatio = div(c.currentAssets - c.stock, c.currentLiab); // row 129
    c.stockDays = c.cogs !== 0 ? div(c.stock * c.days, costBase) : NaN; // row 131
    c.debtorDays = div(c.tradeDebtors * c.days, c.sales); // row 132
    c.creditorDays = div(c.tradeCreditors * c.days, c.cogs); // row 133
    c.wcCycle = (c.stockDays || 0) + (c.debtorDays || 0) - (c.creditorDays || 0); // row 134
    c.wcPerBirr = c.grossProfit !== 0 && c.sales !== 0 ? ((c.stock + c.tradeDebtors - c.tradeCreditors) / c.sales) * (c.days / 365) : NaN; // row 136

    c.tlToTnw = c.tnw > 0 ? c.totalLiab / c.tnw : NaN; // row 145
    c.bankDebtToTnw = c.tnw > 0 ? c.bankDebt / c.tnw : NaN; // row 146
    c.tlToTa = div(c.totalLiab, c.totalAssets); // row 147
    c.interestCover = c.finExp > 0 ? c.operatingProfit / c.finExp : NaN;

    c.trend = {};
    if (base && c.filled) {
      const b = trendOf(base);
      const t = trendOf(c);
      for (const k of Object.keys(t) as (keyof typeof t)[]) if (b[k] !== 0) c.trend[k] = t[k] / b[k];
    }
  });

  // Rows 139 to 142 need the previous period's days, so they run once those exist:
  // working capital released or absorbed if the previous period's days had held
  // on this period's activity.
  cols.forEach((c, i) => {
    const prev = cols.slice(i + 1).find((p) => p.filled);
    if (!prev) {
      c.wcStock = c.wcDebtors = c.wcCreditors = c.wcTotal = NaN;
      return;
    }
    c.wcStock = prev.stock - ((c.cogs + c.directDep + c.otherDirect) * (prev.stockDays || 0)) / c.days;
    c.wcDebtors = prev.tradeDebtors - (c.sales * (prev.debtorDays || 0)) / c.days;
    c.wcCreditors = (c.cogs * (prev.creditorDays || 0)) / c.days - prev.tradeCreditors;
    c.wcTotal = c.wcStock + c.wcDebtors + c.wcCreditors;
  });
  return cols;
}

export const ratioRows: { key: keyof Column; label: string; kind: "pct" | "x" | "days" | "amount" | "birr"; group: string }[] = [
  { key: "salesGrowth", label: "Net sales growth (annualized)", kind: "pct", group: "Profitability" },
  { key: "gpMargin", label: "Gross profit margin", kind: "pct", group: "Profitability" },
  { key: "npMargin", label: "Net profit margin", kind: "pct", group: "Profitability" },
  { key: "roe", label: "Return on equity", kind: "pct", group: "Profitability" },
  { key: "interestCover", label: "Interest cover (operating profit / financial expenses)", kind: "x", group: "Profitability" },
  { key: "currentRatio", label: "Current ratio", kind: "x", group: "Liquidity" },
  { key: "quickRatio", label: "Quick ratio", kind: "x", group: "Liquidity" },
  { key: "stockDays", label: "Stock turnover (days)", kind: "days", group: "Working capital management" },
  { key: "debtorDays", label: "Debtors turnover (days)", kind: "days", group: "Working capital management" },
  { key: "creditorDays", label: "Creditors turnover (days)", kind: "days", group: "Working capital management" },
  { key: "wcCycle", label: "Working capital cycle (days)", kind: "days", group: "Working capital management" },
  { key: "wcPerBirr", label: "Working capital required per one Birr of sales", kind: "birr", group: "Working capital management" },
  { key: "wcStock", label: "Source/(need) from stock", kind: "amount", group: "Working capital source/(need) due to sales growth" },
  { key: "wcDebtors", label: "Source/(need) from trade debtors", kind: "amount", group: "Working capital source/(need) due to sales growth" },
  { key: "wcCreditors", label: "Source/(need) from trade creditors", kind: "amount", group: "Working capital source/(need) due to sales growth" },
  { key: "wcTotal", label: "Total source/(need)", kind: "amount", group: "Working capital source/(need) due to sales growth" },
  { key: "tnw", label: "Tangible net worth (total capital)", kind: "amount", group: "Leverage" },
  { key: "totalAssets", label: "Total assets", kind: "amount", group: "Leverage" },
  { key: "tlToTnw", label: "Total liabilities / tangible net worth", kind: "x", group: "Leverage" },
  { key: "bankDebtToTnw", label: "Bank debt / tangible net worth", kind: "x", group: "Leverage" },
  { key: "tlToTa", label: "Total liabilities / total assets", kind: "pct", group: "Leverage" },
];

export const trendRows: { key: keyof Column["trend"]; label: string }[] = [
  { key: "fixedAssets", label: "Fixed assets" },
  { key: "currentAssets", label: "Current assets" },
  { key: "stock", label: "Stock" },
  { key: "debtors", label: "Debtors" },
  { key: "currentLiab", label: "Current liabilities" },
  { key: "tnw", label: "Tangible net worth" },
  { key: "sales", label: "Sales" },
  { key: "pbt", label: "Profit before tax" },
];

/** Balance check with room for rounding: 0.1% of total assets, at least 1 unit. */
export const unbalanced = (c: Column) => c.filled && Math.abs(c.check) > Math.max(1, Math.abs(c.totalAssets) * 0.001);

export function fmt(n: number, kind: "pct" | "x" | "days" | "amount" | "birr" | "index") {
  if (n == null || !Number.isFinite(n)) return "-";
  switch (kind) {
    case "pct":
      return `${(n * 100).toFixed(1)}%`;
    case "x":
      return `${n.toFixed(2)}x`;
    case "days":
      return `${Math.round(n)}`;
    case "birr":
      return n.toFixed(2);
    case "index":
      return n.toFixed(2);
    default:
      {
      const t = Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 1 });
      return n < 0 ? `(${t})` : t;
    }
  }
}
