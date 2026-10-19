/** Loan maths for the public calculator. Rates are nominal annual rates, as Ethiopian lenders quote them. */

export type Frequency = "monthly" | "quarterly" | "semiannual" | "annual";

export const frequencies: { value: Frequency; label: string; perYear: number; noun: string }[] = [
  { value: "monthly", label: "Monthly", perYear: 12, noun: "month" },
  { value: "quarterly", label: "Quarterly", perYear: 4, noun: "quarter" },
  { value: "semiannual", label: "Semi-annually", perYear: 2, noun: "half-year" },
  { value: "annual", label: "Annually", perYear: 1, noun: "year" },
];

export const perYear = (f: Frequency) => frequencies.find((x) => x.value === f)!.perYear;

/** Number of whole installments that fit in the tenure, and any months left over. */
export function installmentCount(tenureMonths: number, frequency: Frequency) {
  const monthsPerInstallment = 12 / perYear(frequency);
  const n = Math.floor(tenureMonths / monthsPerInstallment);
  return { n, leftoverMonths: tenureMonths - n * monthsPerInstallment };
}

/** Restate an amount the borrower can pay per `from` period as an amount per `to` period. */
export function convertCapacity(amount: number, from: Frequency, to: Frequency) {
  return (amount * perYear(from)) / perYear(to);
}

/** Largest principal that `installment` repays over `n` equal installments. */
export function maxPrincipal(installment: number, annualRatePct: number, frequency: Frequency, n: number) {
  const r = annualRatePct / 100 / perYear(frequency);
  if (n <= 0) return 0;
  if (r === 0) return installment * n;
  return (installment * (1 - Math.pow(1 + r, -n))) / r;
}

/** Equal installment that repays `principal` over `n` installments. */
export function installmentFor(principal: number, annualRatePct: number, frequency: Frequency, n: number) {
  const r = annualRatePct / 100 / perYear(frequency);
  if (n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export type ScheduleRow = { no: number; payment: number; interest: number; principal: number; balance: number };

export function schedule(principal: number, annualRatePct: number, frequency: Frequency, n: number): ScheduleRow[] {
  const r = annualRatePct / 100 / perYear(frequency);
  const payment = installmentFor(principal, annualRatePct, frequency, n);
  const rows: ScheduleRow[] = [];
  let balance = principal;
  for (let no = 1; no <= n; no++) {
    const interest = balance * r;
    // The last installment clears any rounding remainder.
    const principalPart = no === n ? balance : payment - interest;
    balance = Math.max(0, balance - principalPart);
    rows.push({ no, payment: principalPart + interest, interest, principal: principalPart, balance });
  }
  return rows;
}
