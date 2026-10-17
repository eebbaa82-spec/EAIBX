/** Twelve-month cash flow projection for the public forecaster. All amounts in ETB per month. */

export type CashflowInput = {
  openingCash: number;
  revenue: number; // sales in the first month
  growthPct: number; // monthly sales growth
  costOfSalesPct: number; // share of sales spent on stock, materials and direct costs
  collectionMonths: number; // months customers take to pay (0, 1 or 2)
  fixedCosts: number; // rent, salaries, utilities and other monthly overheads
  loanRepayment: number; // monthly loan installments
  oneOffs: { month: number; amount: number }[]; // + for cash in (a loan or grant), - for a purchase
};

export type CashflowMonth = {
  month: number;
  sales: number;
  cashIn: number;
  cashOut: number;
  net: number;
  closing: number;
};

export function forecast(input: CashflowInput, months = 12): CashflowMonth[] {
  const rows: CashflowMonth[] = [];
  const sales: number[] = [];
  let balance = input.openingCash;
  for (let m = 1; m <= months; m++) {
    const s = input.revenue * Math.pow(1 + input.growthPct / 100, m - 1);
    sales.push(s);
    // Sales made before the forecast starts are assumed to be collected at the first month's level.
    const collectedFrom = m - input.collectionMonths;
    const collections = collectedFrom >= 1 ? sales[collectedFrom - 1] : input.collectionMonths > 0 ? input.revenue : s;
    const oneOff = input.oneOffs.filter((o) => o.month === m).reduce((t, o) => t + o.amount, 0);
    const cashIn = collections + Math.max(0, oneOff);
    const cashOut = s * (input.costOfSalesPct / 100) + input.fixedCosts + input.loanRepayment + Math.max(0, -oneOff);
    const net = cashIn - cashOut;
    balance += net;
    rows.push({ month: m, sales: s, cashIn, cashOut, net, closing: balance });
  }
  return rows;
}
