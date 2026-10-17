"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { forecast } from "@/lib/calc/cashflow";

const birr = (n: number) => `ETB ${Math.round(n).toLocaleString("en-US")}`;
const short = (n: number) => Math.round(n).toLocaleString("en-US");
const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-ink focus:border-brand-500 focus:outline-none";
const labelClass = "block text-sm font-medium text-ink";

function num(v: string) {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function monthNames(start: string) {
  if (!start) return Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`);
  const [y, m] = start.split("-").map(Number);
  return Array.from({ length: 12 }, (_, i) =>
    new Date(Date.UTC(y, m - 1 + i, 1)).toLocaleString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }),
  );
}

function nextMonth() {
  const d = new Date();
  const n = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
}

const subscribeNever = () => () => {};

type OneOff = { id: number; month: string; amount: string; label: string };

export function CashflowForecaster() {
  // The default month depends on today's date, so it is set in the browser, not at build time.
  const defaultStart = useSyncExternalStore(subscribeNever, nextMonth, () => "");
  const [chosenStart, setStart] = useState("");
  const start = chosenStart || defaultStart;
  const [f, setF] = useState({
    openingCash: "150000",
    revenue: "200000",
    growthPct: "2",
    costOfSalesPct: "45",
    collectionMonths: "1",
    fixedCosts: "90000",
    loanRepayment: "15000",
  });
  const [oneOffs, setOneOffs] = useState<OneOff[]>([{ id: 1, month: "4", amount: "-250000", label: "New equipment" }]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const names = monthNames(start);
  const rows = useMemo(
    () =>
      forecast({
        openingCash: num(f.openingCash),
        revenue: num(f.revenue),
        growthPct: num(f.growthPct),
        costOfSalesPct: num(f.costOfSalesPct),
        collectionMonths: num(f.collectionMonths),
        fixedCosts: num(f.fixedCosts),
        loanRepayment: num(f.loanRepayment),
        oneOffs: oneOffs.map((o) => ({ month: Number(o.month), amount: num(o.amount) })),
      }),
    [f, oneOffs],
  );

  const lowest = rows.reduce((a, b) => (b.closing < a.closing ? b : a));
  const shortMonths = rows.filter((r) => r.closing < 0);
  const max = Math.max(...rows.map((r) => Math.abs(r.closing)), 1);

  const fields: [keyof typeof f, string, string?][] = [
    ["openingCash", "Cash in the bank today (ETB)"],
    ["revenue", "Sales next month (ETB)"],
    ["growthPct", "Expected sales growth (% per month)", "Use 0 if you expect sales to stay flat, or a negative number if they will fall."],
    ["costOfSalesPct", "Direct costs (% of sales)", "Stock, raw materials, packaging and other costs that rise with sales."],
    ["fixedCosts", "Fixed costs (ETB per month)", "Rent, salaries, utilities, transport, marketing and other overheads."],
    ["loanRepayment", "Loan repayments (ETB per month)"],
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div className="space-y-5 rounded-xl border border-line bg-white p-6">
        <div>
          <label htmlFor="cf-start" className={labelClass}>
            First month of the forecast
          </label>
          <input id="cf-start" type="month" value={start} onChange={(e) => e.target.value && setStart(e.target.value)} className={inputClass} />
        </div>
        {fields.map(([k, label, help]) => (
          <div key={k}>
            <label htmlFor={`cf-${k}`} className={labelClass}>
              {label}
            </label>
            <input id={`cf-${k}`} inputMode="decimal" value={f[k]} onChange={set(k)} className={inputClass} />
            {help && <p className="mt-1 text-xs text-muted">{help}</p>}
          </div>
        ))}
        <div>
          <label htmlFor="cf-collection" className={labelClass}>
            When customers pay you
          </label>
          <select id="cf-collection" value={f.collectionMonths} onChange={set("collectionMonths")} className={inputClass}>
            <option value="0">Immediately (cash sales)</option>
            <option value="1">About 30 days after the sale</option>
            <option value="2">About 60 days after the sale</option>
          </select>
        </div>

        <fieldset className="min-w-0">
          <legend className={labelClass}>One-off items</legend>
          <p className="mt-1 text-xs text-muted">
            A positive amount is money coming in (a new loan, a grant, an investment). A negative amount is money going out (equipment,
            a tax payment, a license renewal).
          </p>
          <ul className="mt-3 space-y-2">
            {oneOffs.map((o) => (
              <li key={o.id} className="grid grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,7rem)_auto] items-center gap-2">
                <input
                  aria-label="Description"
                  value={o.label}
                  onChange={(e) => setOneOffs(oneOffs.map((x) => (x.id === o.id ? { ...x, label: e.target.value } : x)))}
                  className="min-w-0 rounded-lg border border-line px-2 py-1.5 text-sm"
                />
                <select
                  aria-label="Month"
                  value={o.month}
                  onChange={(e) => setOneOffs(oneOffs.map((x) => (x.id === o.id ? { ...x, month: e.target.value } : x)))}
                  className="min-w-0 rounded-lg border border-line px-2 py-1.5 text-sm"
                >
                  {names.map((n, i) => (
                    <option key={n} value={i + 1}>
                      {n}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Amount (ETB)"
                  inputMode="decimal"
                  value={o.amount}
                  onChange={(e) => setOneOffs(oneOffs.map((x) => (x.id === o.id ? { ...x, amount: e.target.value } : x)))}
                  className="min-w-0 rounded-lg border border-line px-2 py-1.5 text-sm"
                />
                <button
                  type="button"
                  aria-label={`Remove ${o.label || "item"}`}
                  onClick={() => setOneOffs(oneOffs.filter((x) => x.id !== o.id))}
                  className="px-2 text-muted hover:text-ink"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setOneOffs([...oneOffs, { id: Date.now(), month: "1", amount: "0", label: "" }])}
            className="mt-2 text-sm font-semibold text-brand-700 hover:underline"
          >
            + Add an item
          </button>
        </fieldset>
      </div>

      <div aria-live="polite" className="space-y-6">
        <div className={`rounded-xl p-6 ${shortMonths.length ? "bg-red-50 text-red-900" : "bg-gradient-to-br from-brand-900 to-brand-700 text-white"}`}>
          {shortMonths.length ? (
            <>
              <p className="text-sm font-semibold">Cash shortfall ahead</p>
              <p className="mt-1 text-2xl font-extrabold">
                You run short in {names[shortMonths[0].month - 1]}, by {birr(-shortMonths[0].closing)}.
              </p>
              <p className="mt-2 text-sm">
                Cash is below zero in {shortMonths.length} of the 12 months. The lowest point is {birr(lowest.closing)} in {names[lowest.month - 1]}.
                Consider arranging finance before then, collecting from customers sooner, or cutting fixed costs.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-brand-100">Cash stays positive for all 12 months</p>
              <p className="mt-1 text-2xl font-extrabold">Lowest balance: {birr(lowest.closing)} in {names[lowest.month - 1]}</p>
              <p className="mt-2 text-sm text-brand-100">Closing balance after 12 months: {birr(rows[11].closing)}.</p>
            </>
          )}
        </div>

        <figure className="rounded-xl border border-line bg-white p-4">
          <figcaption className="mb-3 text-sm font-semibold text-ink">Cash at the end of each month</figcaption>
          <div className="flex h-48 items-stretch gap-1" role="img" aria-label="Bar chart of closing cash by month">
            {rows.map((r) => (
              <div key={r.month} className="flex flex-1 flex-col" title={`${names[r.month - 1]}: ${birr(r.closing)}`}>
                <div className="flex flex-1 items-end">
                  {r.closing >= 0 && <div className="w-full rounded-t bg-brand-600" style={{ height: `${(r.closing / max) * 100}%` }} />}
                </div>
                <div className="h-px bg-line" />
                <div className="flex flex-1 items-start">
                  {r.closing < 0 && <div className="w-full rounded-b bg-red-500" style={{ height: `${(-r.closing / max) * 100}%` }} />}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1 flex gap-1 text-[10px] text-muted">
            {names.map((n) => (
              <span key={n} className="flex-1 text-center">
                {n.split(" ")[0]}
              </span>
            ))}
          </div>
        </figure>

        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full text-right text-sm">
            <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="p-2 text-left">Month</th>
                <th className="p-2">Cash in</th>
                <th className="p-2">Cash out</th>
                <th className="p-2">Net</th>
                <th className="p-2">Closing cash</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.month} className="border-t border-line">
                  <td className="p-2 text-left text-muted">{names[r.month - 1]}</td>
                  <td className="p-2">{short(r.cashIn)}</td>
                  <td className="p-2">{short(r.cashOut)}</td>
                  <td className={`p-2 ${r.net < 0 ? "text-red-700" : ""}`}>{short(r.net)}</td>
                  <td className={`p-2 font-semibold ${r.closing < 0 ? "text-red-700" : "text-ink"}`}>{short(r.closing)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted">
          A simple planning estimate based on your own figures. It leaves out VAT, income tax timing and changes in stock levels. Nothing you
          enter is saved or sent anywhere.
        </p>
      </div>
    </div>
  );
}
