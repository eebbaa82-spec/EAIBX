"use client";

import { useState } from "react";
import type { CaseAnalysis, CreditCase } from "@/lib/credit/case";
import { projection, type ProjectionInput, type Scenario, type YearRow } from "@/lib/credit/projection";
import { inputClass } from "./creditFields";

/**
 * Cash flow projection over the loan period and the repayment capacity test
 * under three scenarios, with the assumptions the analyst can change.
 */

const n0 = (n: number) => (Number.isFinite(n) ? (n < 0 ? `(${Math.round(-n).toLocaleString("en-US")})` : Math.round(n).toLocaleString("en-US")) : "-");
const x2 = (n: number) => (Number.isFinite(n) ? `${n.toFixed(2)}x` : "-");
const p1 = (n: number) => `${(n * 100).toFixed(1)}`;

export const projectionLines: { key: keyof YearRow; label: string; ratio?: boolean; strong?: boolean }[] = [
  { key: "sales", label: "Sales" },
  { key: "ebitda", label: "Operating cash profit (before depreciation)" },
  { key: "tax", label: "Less tax" },
  { key: "wcChange", label: "Less increase in working capital" },
  { key: "capex", label: "Less capital expenditure" },
  { key: "cfads", label: "Cash available for debt service", strong: true },
  { key: "interest", label: "Interest" },
  { key: "principal", label: "Principal repayment" },
  { key: "debtService", label: "Total debt service", strong: true },
  { key: "dscr", label: "Debt service cover", ratio: true, strong: true },
  { key: "netCash", label: "Net cash flow after debt service" },
  { key: "cash", label: "Closing cash" },
];

export const resultClass = (r: Scenario["result"]) => (r === "Shortfall" ? "text-red-700" : r === "Tight" ? "text-amber-700" : "text-brand-700");

export function CreditProjection({ k, a, set }: { k: CreditCase; a: CaseAnalysis; set: (p: Partial<CreditCase>) => void }) {
  const [shown, setShown] = useState<Scenario["key"]>("base");
  const proj = projection(k, a);
  if (!proj) return <p className="text-sm text-muted">Enter the financial statements, with sales, to project the cash flows.</p>;
  const { input, years, scenarios } = proj;
  const put = (key: keyof ProjectionInput, v: string) => set({ projection: { ...k.projection, [key]: v } });
  const field = (key: keyof ProjectionInput, label: string, auto: string, hint?: string) => (
    <label className="block text-sm font-medium text-ink">
      {label}
      <input type="number" inputMode="decimal" value={k.projection[key]} placeholder={auto} onChange={(e) => put(key, e.target.value)} className={inputClass} />
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
  const sc = scenarios.find((s) => s.key === shown) ?? scenarios[0];

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        The projection runs for {years} year{years === 1 ? "" : "s"}, the longest tenure of the recommended facilities (or the request), starting from the latest period&apos;s annualized figures. Term
        loans are repaid in equal yearly installments with interest on the balance; overdrafts and other revolving facilities pay interest only. Leave a box empty to use the figure shown.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {field("growth", "Sales growth a year (%)", p1(input.growth), "From the sales trend, kept between -5% and 15%.")}
        {field("margin", "Gross margin before depreciation (%)", p1(input.margin))}
        {field("opex", "Operating expenses, % of sales", p1(input.opex), "Administration, selling and staff costs.")}
        {field("tax", "Profit tax rate (%)", p1(input.tax))}
        {field("rate", "Interest rate on new facilities (%)", p1(input.rate), "Used where the recommendation gives no rate.")}
        {field("capex", `Capital expenditure a year (${k.unit})`, String(Math.round(input.capex)), "Defaults to depreciation, to keep assets in working order.")}
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-2 py-2">Scenario</th>
              <th className="px-2 py-2 text-right">Lowest cover</th>
              <th className="px-2 py-2 text-right">Average cover</th>
              <th className="px-2 py-2 text-right">Years short</th>
              <th className="px-2 py-2 text-right">Cash at the end ({k.unit})</th>
              <th className="px-2 py-2">Repayment capacity</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s) => (
              <tr key={s.key} className="border-t border-line align-top">
                <td className="px-2 py-1.5">
                  <span className="font-semibold">{s.name}</span>
                  <span className="block text-xs text-muted">{s.shock}</span>
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">{x2(s.minDscr)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{x2(s.avgDscr)}</td>
                <td className="px-2 py-1.5 text-right">{s.shortYears}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{n0(s.rows[s.rows.length - 1]?.cash ?? NaN)}</td>
                <td className={`px-2 py-1.5 font-semibold ${resultClass(s.result)}`}>{s.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">Comfortable: cover of 1.25x or more in every year. Tight: between 1.00x and 1.25x in at least one year. Shortfall: below 1.00x in at least one year.</p>

      <div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Scenario">
          {scenarios.map((s) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={shown === s.key}
              onClick={() => setShown(s.key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${shown === s.key ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-ink hover:border-brand-600"}`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-white">
          <ProjectionTable s={sc} unit={k.unit} />
        </div>
      </div>
    </div>
  );
}

export function ProjectionTable({ s, unit }: { s: Scenario; unit: string }) {
  return (
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
        <tr>
          <th className="px-2 py-2">{unit}</th>
          {s.rows.map((r) => (
            <th key={r.year} className="px-2 py-2 text-right">
              Year {r.year}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {projectionLines.map((line) => (
          <tr key={line.key} className={`border-t border-line ${line.strong ? "font-semibold" : ""}`}>
            <td className="px-2 py-1.5">{line.label}</td>
            {s.rows.map((r) => (
              <td key={r.year} className={`px-2 py-1.5 text-right tabular-nums ${line.key === "dscr" && r.dscr < 1 ? "text-red-700" : ""}`}>
                {line.ratio ? x2(r[line.key] as number) : n0(r[line.key] as number)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
