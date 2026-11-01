"use client";

import type { ClipboardEvent } from "react";
import { periodLabel } from "@/lib/credit/case";
import {
  balanceSheet,
  fmt,
  periodDays,
  PERIODS,
  profitLoss,
  ratioRows,
  reconciliationLines,
  trendRows,
  type Column,
  type LineGroup,
  type LineId,
  type Period,
  type SpreadInput,
  unbalanced,
} from "@/lib/credit/spread";

/**
 * Spreadsheet-style entry for the financial analysis form: the same lines and
 * five period columns as the lender's workbook, newest period on the left.
 * Pasting a block copied from Excel fills the cells down and across.
 */

// Row of each line in the Excel template, so a block copied from the workbook
// (totals and headings included) lands on the right lines when pasted.
const excelRow: Record<LineId, number> = {
  landBuilding: 9, machinery: 10, otherFixed: 11,
  cash: 13, stock: 14, tradeDebtors: 15, otherDebtors: 16, interCoDebtors: 17, otherCurrent: 18,
  shortLoans: 20, currentPortion: 21, tradeCreditors: 22, otherCreditors: 23, interCoCreditors: 24, currentTaxes: 25, dividendsPayable: 26, otherCurrentLiab: 27,
  ltLoans: 31, deferredTax: 32, shareholderLoans: 33, interCoLoans: 34, otherLtCreditors: 35, grants: 36,
  capital: 38, reserves: 39, retained: 40, otherEquity: 41,
  sales: 60, cogs: 61, directDep: 62, otherDirect: 63,
  admin: 65, depreciation: 66, amortization: 67, remuneration: 68,
  finExp: 70, lossDisposal: 71, otherExp: 72, interestIncome: 74, otherIncome: 75,
  tax: 78, extraordinary: 79, dividendsPaid: 82,
  assetsSold: 92, revaluation: 94,
};
const lineAt = Object.fromEntries(Object.entries(excelRow).map(([id, r]) => [r, id as LineId])) as Record<number, LineId>;
const cell = "w-full min-w-20 rounded border border-line bg-white px-1.5 py-1 text-right text-sm tabular-nums text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";
const types: Period["type"][] = ["", "Audited", "Interim", "Provisional", "Projected"];

export function SpreadEntry({ spread, onChange, unit }: { spread: SpreadInput; onChange: (s: SpreadInput) => void; unit: string }) {
  const setValue = (id: LineId, i: number, v: string) => {
    const row = [...(spread.values[id] ?? Array(PERIODS).fill(""))];
    row[i] = v;
    onChange({ ...spread, values: { ...spread.values, [id]: row } });
  };
  const setPeriod = (i: number, patch: Partial<Period>) => onChange({ ...spread, periods: spread.periods.map((p, j) => (j === i ? { ...p, ...patch } : p)) });

  const paste = (id: LineId, i: number) => (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text/plain");
    if (!/[\t\n]/.test(text.trim())) return;
    e.preventDefault();
    const lines = text.replace(/\r/g, "").replace(/\n$/, "").split("\n").map((l) => l.split("\t"));
    const values = { ...spread.values };
    const start = excelRow[id];
    lines.forEach((cells, r) => {
      const line = lineAt[start + r];
      if (!line) return;
      const row = [...(values[line] ?? Array(PERIODS).fill(""))];
      cells.forEach((v, c) => {
        if (i + c < PERIODS) row[i + c] = v.trim();
      });
      values[line] = row;
    });
    onChange({ ...spread, values });
  };

  const group = (g: LineGroup) => (
    <tbody key={g.title}>
      <tr>
        <th colSpan={PERIODS + 1} className="bg-canvas px-2 pb-1 pt-3 text-left text-xs font-bold uppercase tracking-wide text-brand-700">
          {g.title}
        </th>
      </tr>
      {g.lines.map((l) => (
        <tr key={l.id} className="border-t border-line">
          <th scope="row" className="sticky left-0 z-10 bg-white px-2 py-1 text-left text-sm font-normal text-ink">
            {l.label}
          </th>
          {Array.from({ length: PERIODS }, (_, i) => (
            <td key={i} className="px-1 py-1">
              <input aria-label={`${l.label}, period ${i + 1}`} inputMode="decimal" value={spread.values[l.id]?.[i] ?? ""} onChange={(e) => setValue(l.id, i, e.target.value)} onPaste={paste(l.id, i)} className={cell} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="bg-brand-900 text-white">
              <th className="sticky left-0 z-10 bg-brand-900 px-2 py-2 text-left text-sm">Amounts in {unit}</th>
              {Array.from({ length: PERIODS }, (_, i) => (
                <th key={i} className="px-1 py-2 text-xs font-semibold">
                  {i === 0 ? "Latest" : i === PERIODS - 1 ? "Oldest" : `Period ${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="sticky left-0 z-10 bg-white px-2 py-1 text-left text-sm font-semibold">
                As at
              </th>
              {spread.periods.map((p, i) => (
                <td key={i} className="px-1 py-1">
                  <input aria-label={`Period ${i + 1} date`} type="date" value={p.date} onChange={(e) => setPeriod(i, { date: e.target.value })} className={cell} />
                </td>
              ))}
            </tr>
            <tr className="border-t border-line">
              <th scope="row" className="sticky left-0 z-10 bg-white px-2 py-1 text-left text-sm font-semibold">
                Period length (days)
              </th>
              {spread.periods.map((p, i) => (
                <td key={i} className="px-1 py-1">
                  <input aria-label={`Period ${i + 1} length in days`} inputMode="numeric" value={p.days} placeholder={String(periodDays(spread.periods, i))} onChange={(e) => setPeriod(i, { days: e.target.value })} className={cell} />
                </td>
              ))}
            </tr>
            <tr className="border-t border-line">
              <th scope="row" className="sticky left-0 z-10 bg-white px-2 py-1 text-left text-sm font-semibold">
                Type of statement
              </th>
              {spread.periods.map((p, i) => (
                <td key={i} className="px-1 py-1">
                  <select aria-label={`Period ${i + 1} statement type`} value={p.type} onChange={(e) => setPeriod(i, { type: e.target.value as Period["type"] })} className={`${cell} text-left`}>
                    {types.map((t) => (
                      <option key={t} value={t}>
                        {t || "Select"}
                      </option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
          </tbody>
          <tbody>
            <tr>
              <th colSpan={PERIODS + 1} className="bg-brand-50 px-2 py-2 text-left text-sm font-bold text-ink">
                Balance sheet
              </th>
            </tr>
          </tbody>
          {balanceSheet.map(group)}
          <tbody>
            <tr>
              <th colSpan={PERIODS + 1} className="bg-brand-50 px-2 py-2 text-left text-sm font-bold text-ink">
                Profit and loss account
              </th>
            </tr>
          </tbody>
          {profitLoss.map(group)}
          {group({ title: "Fixed asset reconciliation", lines: reconciliationLines })}
        </table>
      </div>
    </div>
  );
}

const amountCell = "px-2 py-1 text-right tabular-nums";

function Header({ cols, label }: { cols: Column[]; label: string }) {
  return (
    <thead>
      <tr className="bg-brand-900 text-white">
        <th className="sticky left-0 z-10 bg-brand-900 px-2 py-2 text-left text-sm">{label}</th>
        {cols.map((c, i) => (
          <th key={i} className="px-2 py-2 text-right text-xs font-semibold">
            {periodLabel(c) || "-"}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/** Totals, reconciliation, trend and analytical ratios, laid out like the workbook. */
export function SpreadOutcomes({ cols, unit }: { cols: Column[]; unit: string }) {
  const shown = cols.filter((c) => c.filled);
  if (!shown.length) return <p className="text-muted">Enter at least one period of figures on the previous step to see the outcomes.</p>;
  const totals: { key: keyof Column; label: string; strong?: boolean }[] = [
    { key: "fixedAssets", label: "Fixed assets" },
    { key: "currentAssets", label: "Current assets" },
    { key: "currentLiab", label: "Current liabilities" },
    { key: "netCurrentAssets", label: "Net current assets", strong: true },
    { key: "employment", label: "Employment of capital", strong: true },
    { key: "termLiab", label: "Term liabilities" },
    { key: "tnw", label: "Tangible net worth", strong: true },
    { key: "capitalEmployed", label: "Capital employed", strong: true },
    { key: "check", label: "Check (should be 0)" },
    { key: "sales", label: "Net sales" },
    { key: "grossProfit", label: "Gross profit" },
    { key: "operatingProfit", label: "Operating profit" },
    { key: "pbt", label: "Profit/(loss) before tax" },
    { key: "netProfit", label: "Net profit/(loss) after tax", strong: true },
    { key: "toReserves", label: "To reserves" },
  ];
  const recon: { key: keyof Column; label: string }[] = [
    { key: "openingFA", label: "Opening fixed assets (previous period)" },
    { key: "depTotal", label: "Depreciation (direct and other)" },
    { key: "assetsSold", label: "Fixed assets sold" },
    { key: "revaluation", label: "Revaluations" },
    { key: "fixedAssets", label: "Ending fixed assets" },
    { key: "capex", label: "Capital expenditure" },
  ];
  const groups = [...new Set(ratioRows.map((r) => r.group))];
  const table = "w-full min-w-[640px] border-collapse text-sm";

  return (
    <div className="space-y-8">
      {shown.some(unbalanced) && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          The balance sheet does not balance for {shown.filter(unbalanced).map(periodLabel).join(", ")}. Total assets less total liabilities should be zero; check the entries before relying on the ratios. Rounding differences under 0.1% of total assets are ignored.
        </p>
      )}
      <div>
        <h3 className="mb-2 text-lg font-bold text-ink">Totals ({unit})</h3>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className={table}>
            <Header cols={shown} label="Line" />
            <tbody>
              {totals.map((t) => (
                <tr key={t.key} className={`border-t border-line ${t.strong ? "font-semibold" : ""}`}>
                  <th scope="row" className="sticky left-0 bg-white px-2 py-1 text-left font-[inherit]">
                    {t.label}
                  </th>
                  {shown.map((c, i) => (
                    <td key={i} className={`${amountCell} ${t.key === "check" && unbalanced(c) ? "text-red-700" : ""}`}>
                      {fmt(c[t.key] as number, "amount")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-bold text-ink">Analytical ratios</h3>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className={table}>
            <Header cols={shown} label="Ratio" />
            {groups.map((g) => (
              <tbody key={g}>
                <tr>
                  <th colSpan={shown.length + 1} className="bg-canvas px-2 pb-1 pt-3 text-left text-xs font-bold uppercase tracking-wide text-brand-700">
                    {g}
                  </th>
                </tr>
                {ratioRows
                  .filter((r) => r.group === g)
                  .map((r) => (
                    <tr key={r.key} className="border-t border-line">
                      <th scope="row" className="sticky left-0 bg-white px-2 py-1 text-left font-normal">
                        {r.label}
                      </th>
                      {shown.map((c, i) => (
                        <td key={i} className={amountCell}>
                          {fmt(c[r.key] as number, r.kind)}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            ))}
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">
          Sales growth is annualized by period length. Stock days use cost of goods sold plus direct costs; creditor days use cost of goods sold. Bank debt is short loans, the current portion
          of long/medium loans and long/medium loans. Working capital source/(need) compares this period with the previous period&apos;s days.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="mb-2 text-lg font-bold text-ink">Trend (oldest period = 1.00)</h3>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full border-collapse text-sm">
              <Header cols={shown} label="Item" />
              <tbody>
                {trendRows.map((r) => (
                  <tr key={r.key} className="border-t border-line">
                    <th scope="row" className="sticky left-0 bg-white px-2 py-1 text-left font-normal">
                      {r.label}
                    </th>
                    {shown.map((c, i) => (
                      <td key={i} className={amountCell}>
                        {fmt(c.trend[r.key] ?? NaN, "index")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-lg font-bold text-ink">Fixed asset reconciliation ({unit})</h3>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full border-collapse text-sm">
              <Header cols={shown} label="Item" />
              <tbody>
                {recon.map((r) => (
                  <tr key={r.key} className={`border-t border-line ${r.key === "capex" ? "font-semibold" : ""}`}>
                    <th scope="row" className="sticky left-0 bg-white px-2 py-1 text-left font-[inherit]">
                      {r.label}
                    </th>
                    {shown.map((c, i) => (
                      <td key={i} className={amountCell}>
                        {fmt(c[r.key] as number, "amount")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">Capital expenditure = ending fixed assets less (opening fixed assets less depreciation less assets sold plus revaluations).</p>
        </div>
      </div>
    </div>
  );
}
