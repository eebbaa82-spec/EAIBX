"use client";

import { useMemo, useState } from "react";
import {
  convertCapacity,
  frequencies,
  installmentCount,
  installmentFor,
  maxPrincipal,
  schedule,
  type Frequency,
} from "@/lib/calc/loan";

type Mode = "borrow" | "repay";

const birr = (n: number) =>
  `ETB ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const nounOf = (f: Frequency) => frequencies.find((x) => x.value === f)!.noun;
const labelOf = (f: Frequency) => frequencies.find((x) => x.value === f)!.label.toLowerCase();

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-ink focus:border-brand-500 focus:outline-none";
const labelClass = "block text-sm font-medium text-ink";

function num(value: string) {
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

export function LoanCalculator() {
  const [mode, setMode] = useState<Mode>("borrow");
  const [capacity, setCapacity] = useState("10000");
  const [capacityFreq, setCapacityFreq] = useState<Frequency>("monthly");
  const [amount, setAmount] = useState("500000");
  const [repayFreq, setRepayFreq] = useState<Frequency>("monthly");
  const [tenure, setTenure] = useState("5");
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years");
  const [rate, setRate] = useState("15");

  const result = useMemo(() => {
    const t = num(tenure);
    const r = num(rate);
    if (!(t > 0) || Number.isNaN(r) || r > 100) return { error: "Enter a tenure above zero and an interest rate between 0 and 100%." };
    const tenureMonths = Math.round(tenureUnit === "years" ? t * 12 : t);
    const { n, leftoverMonths } = installmentCount(tenureMonths, repayFreq);
    if (n < 1) return { error: `The tenure is shorter than one ${nounOf(repayFreq)}, so no ${labelOf(repayFreq)} installment fits.` };

    let principal: number;
    let installment: number;
    if (mode === "borrow") {
      const c = num(capacity);
      if (!(c > 0)) return { error: "Enter the amount you can pay." };
      installment = convertCapacity(c, capacityFreq, repayFreq);
      principal = maxPrincipal(installment, r, repayFreq, n);
    } else {
      principal = num(amount);
      if (!(principal > 0)) return { error: "Enter the loan amount." };
      installment = installmentFor(principal, r, repayFreq, n);
    }
    const rows = schedule(principal, r, repayFreq, n);
    const totalPaid = rows.reduce((s, x) => s + x.payment, 0);
    return { principal, installment, n, leftoverMonths, tenureMonths, rows, totalPaid, totalInterest: totalPaid - principal };
  }, [mode, capacity, capacityFreq, amount, repayFreq, tenure, tenureUnit, rate]);

  function downloadCsv() {
    if (!("rows" in result) || !result.rows) return;
    const lines = [
      "Installment,Payment (ETB),Interest (ETB),Principal (ETB),Balance after (ETB)",
      ...result.rows.map((x) => [x.no, x.payment, x.interest, x.principal, x.balance].map((v) => (typeof v === "number" && !Number.isInteger(v) ? v.toFixed(2) : v)).join(",")),
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "Kena-loan-schedule.csv" });
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="rounded-xl border border-line bg-white p-6">
        <div role="tablist" aria-label="Calculator mode" className="mb-6 grid grid-cols-2 rounded-lg bg-canvas p-1 text-sm font-semibold">
          {(
            [
              ["borrow", "How much can I borrow?"],
              ["repay", "What will I repay?"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => setMode(value)}
              className={`rounded-md px-3 py-2 ${mode === value ? "bg-white text-brand-800 shadow-sm" : "text-muted hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {mode === "borrow" ? (
            <div>
              <label htmlFor="capacity" className={labelClass}>
                What you can afford to pay (ETB)
              </label>
              <div className="flex gap-2">
                <input id="capacity" inputMode="decimal" value={capacity} onChange={(e) => setCapacity(e.target.value)} className={inputClass} />
                <select aria-label="Per" value={capacityFreq} onChange={(e) => setCapacityFreq(e.target.value as Frequency)} className={`${inputClass} max-w-44`}>
                  {frequencies.map((f) => (
                    <option key={f.value} value={f.value}>
                      per {f.noun}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="amount" className={labelClass}>
                Loan amount (ETB)
              </label>
              <input id="amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
            </div>
          )}

          <fieldset>
            <legend className={labelClass}>Repayment frequency</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {frequencies.map((f) => (
                <label
                  key={f.value}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm ${repayFreq === f.value ? "border-brand-600 bg-brand-50 font-semibold text-brand-800" : "border-line text-ink"}`}
                >
                  <input type="radio" name="freq" value={f.value} checked={repayFreq === f.value} onChange={() => setRepayFreq(f.value)} className="sr-only" />
                  {f.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="tenure" className={labelClass}>
              Loan tenure
            </label>
            <div className="flex gap-2">
              <input id="tenure" inputMode="decimal" value={tenure} onChange={(e) => setTenure(e.target.value)} className={inputClass} />
              <select aria-label="Tenure unit" value={tenureUnit} onChange={(e) => setTenureUnit(e.target.value as "years" | "months")} className={`${inputClass} max-w-36`}>
                <option value="years">years</option>
                <option value="months">months</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="rate" className={labelClass}>
              Interest rate (% per year)
            </label>
            <input id="rate" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className={inputClass} />
            <p className="mt-1 text-xs text-muted">Use the annual rate your bank or MFI quotes.</p>
          </div>
        </div>
      </div>

      <div aria-live="polite">
        {"error" in result ? (
          <div className="rounded-xl border border-line bg-canvas p-6 text-ink">{result.error}</div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl bg-gradient-to-br from-brand-900 to-brand-700 p-6 text-white">
              <p className="text-sm text-brand-100">{mode === "borrow" ? "You could borrow up to" : `Your ${labelOf(repayFreq)} installment`}</p>
              <p className="mt-1 text-4xl font-extrabold tracking-tight">{birr(mode === "borrow" ? result.principal : result.installment)}</p>
              <p className="mt-3 text-sm text-brand-100">
                {mode === "borrow"
                  ? `Repaid in ${result.n} ${labelOf(repayFreq)} installments of ${birr(result.installment)}.`
                  : `${result.n} ${labelOf(repayFreq)} installments for a loan of ${birr(result.principal)}.`}
              </p>
            </div>

            <dl className="grid gap-3 sm:grid-cols-3">
              {[
                ["Loan amount", birr(result.principal)],
                ["Total interest", birr(result.totalInterest)],
                ["Total repaid", birr(result.totalPaid)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-line bg-white p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{k}</dt>
                  <dd className="mt-1 font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            {mode === "borrow" && capacityFreq !== repayFreq && (
              <p className="text-sm text-muted">
                Paying {birr(num(capacity))} per {nounOf(capacityFreq)} equals {birr(result.installment)} per {nounOf(repayFreq)}. With
                less frequent repayments you set money aside between installments.
              </p>
            )}
            {result.leftoverMonths > 0 && (
              <p className="text-sm text-muted">
                {result.leftoverMonths} month{result.leftoverMonths === 1 ? "" : "s"} of the {result.tenureMonths}-month tenure do not make up a
                full {nounOf(repayFreq)}, so the schedule ends after {result.n} installments.
              </p>
            )}

            <details className="rounded-xl border border-line bg-white">
              <summary className="cursor-pointer p-4 font-semibold text-ink">Repayment schedule ({result.n} installments)</summary>
              <div className="max-h-96 overflow-auto border-t border-line">
                <table className="w-full text-right text-sm">
                  <thead className="sticky top-0 bg-canvas text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="p-2 text-left">#</th>
                      <th className="p-2">Payment</th>
                      <th className="p-2">Interest</th>
                      <th className="p-2">Principal</th>
                      <th className="p-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((x) => (
                      <tr key={x.no} className="border-t border-line">
                        <td className="p-2 text-left text-muted">{x.no}</td>
                        <td className="p-2">{x.payment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="p-2">{x.interest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="p-2">{x.principal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="p-2">{x.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-line p-4">
                <button type="button" onClick={downloadCsv} className="text-sm font-semibold text-brand-700 hover:underline">
                  Download schedule (CSV, opens in Excel)
                </button>
              </div>
            </details>

            <p className="text-xs text-muted">
              Estimates only, assuming equal installments and a fixed rate. Your lender&apos;s offer may differ because of fees, insurance,
              collateral requirements, grace periods or its own credit assessment. This is not a loan offer or financial advice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
