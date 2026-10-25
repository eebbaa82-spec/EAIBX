"use client";

import { useState } from "react";
import type { CreditCase } from "@/lib/credit/case";
import { positiveLines, type ParsedStatement } from "@/lib/credit/fsparse";
import { balanceSheet, PERIODS, profitLoss, reconciliationLines, type LineId, type SpreadInput } from "@/lib/credit/spread";
import { inputClass, smallButton } from "./creditFields";

/**
 * Upload financial statements (PDF, scanned PDF or Excel) and put their figures
 * into the financial analysis form. The analyst sees where every statement line
 * goes and can change it before applying.
 */

const lineOptions = [...balanceSheet, ...profitLoss, { title: "Fixed asset reconciliation", lines: reconciliationLines }].flatMap((g) => g.lines.map((l) => ({ id: l.id, label: `${g.title}: ${l.label}` })));
const unitScale: Record<string, number> = { "ETB '000": 1000, ETB: 1, "ETB million": 1000000 };
const fmt = (n: number | null) => (n === null ? "" : n < 0 ? `(${Math.abs(n).toLocaleString("en-US")})` : n.toLocaleString("en-US"));

export function StatementsImport({ k, set, onDone, templateHref }: { k: CreditCase; set: (p: Partial<CreditCase>) => void; onDone: () => void; templateHref: string }) {
  const [parsed, setParsed] = useState<ParsedStatement | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [slots, setSlots] = useState<number[]>([]);
  const [scale, setScale] = useState(1);

  const firstEmpty = () => {
    const filled = k.spread.periods.map((p, i) => !!p.date || Object.values(k.spread.values).some((row) => (row?.[i] ?? "").trim() !== ""));
    const i = filled.indexOf(false);
    return i < 0 ? 0 : i;
  };

  const read = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setMsg("");
    setParsed(null);
    try {
      const { readStatements, OldExcelFormat } = await import("@/lib/credit/fsread");
      const r = await readStatements(file, setMsg).catch((e) => {
        if (e instanceof OldExcelFormat) {
          setMsg("This is the older Excel format (.xls). Open it in Excel, choose Save As, pick \"Excel Workbook (.xlsx)\", and upload the saved file.");
          return undefined;
        }
        throw e;
      });
      if (r === undefined) return;
      if (!r) {
        setMsg(
          "No balance sheet or profit and loss figures were found in this file. Check that it holds the statement of financial position and the income statement, with line names in the first column and the amounts for each year in their own columns, or enter the figures below.",
        );
        return;
      }
      setParsed(r);
      setScale(r.scale);
      const start = firstEmpty();
      setSlots(r.columns.map((_, i) => (start + i < PERIODS ? start + i : -1)));
      setMsg(
        `Found ${r.rows.length} statement lines for ${r.columns.map((c) => c.label || "a period").join(" and ")}${r.source === "ocr" ? ", read from scanned pages; check the amounts against the statements" : ""}. Check where each line goes, then put the figures into the form.`,
      );
    } catch (e) {
      console.error(e);
      setMsg("This file could not be read. Upload the statements as an Excel workbook (.xlsx), or use the Excel template.");
    } finally {
      setBusy(false);
    }
  };

  const setTarget = (i: number, target: LineId | "") => parsed && setParsed({ ...parsed, rows: parsed.rows.map((r, j) => (j === i ? { ...r, target } : r)) });

  const apply = () => {
    if (!parsed) return;
    const factor = scale / (unitScale[k.unit] ?? 1000);
    const spread: SpreadInput = { periods: k.spread.periods.map((p) => ({ ...p })), values: { ...k.spread.values } };
    parsed.columns.forEach((col, c) => {
      const slot = slots[c];
      if (slot < 0) return;
      // A fresh import replaces the whole period.
      for (const id of lineOptions.map((l) => l.id)) {
        const row = [...(spread.values[id] ?? Array(PERIODS).fill(""))];
        row[slot] = "";
        spread.values[id] = row;
      }
      const sums = new Map<LineId, number>();
      for (const r of parsed.rows) {
        const v = r.values[c];
        if (!r.target || v === null) continue;
        const amount = positiveLines.includes(r.target) ? Math.abs(v) : v;
        sums.set(r.target, (sums.get(r.target) ?? 0) + amount * factor);
      }
      for (const [id, v] of sums) {
        const row = [...(spread.values[id] ?? Array(PERIODS).fill(""))];
        row[slot] = String(Math.round(v * 100) / 100);
        spread.values[id] = row;
      }
      spread.periods[slot] = { ...spread.periods[slot], date: col.date || spread.periods[slot].date, type: parsed.audited ? "Audited" : spread.periods[slot].type || "Provisional" };
    });
    set({ spread });
    setParsed(null);
    setMsg("The figures are in the form. Check the balance on the Outcomes step.");
    onDone();
  };

  return (
    <div className="space-y-4 rounded-2xl border border-gold-400 bg-gold-100 p-5">
      <div>
        <p className="font-semibold text-ink">Upload the financial statements in Excel</p>
        <p className="mt-1 text-sm text-muted">
          Upload the balance sheet and income statement as an Excel workbook (.xlsx), as prepared by the borrower or the auditor, or fill in the Kenna Ventures template. The workspace finds each
          statement line and each year, puts the figures into the form and calculates the analysis. Excel gives exact figures, so there is nothing to retype or check against a scan.
          Upload one workbook per set of statements; each fills the next empty periods. Files are read in this browser.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className={`relative inline-block cursor-pointer rounded-full bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700 ${busy ? "opacity-60" : ""}`}>
          {busy ? "Reading..." : "Upload Excel statements"}
          <input
            type="file"
            accept=".xlsx,.xlsm,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              read(f);
            }}
          />
        </label>
        <a href={templateHref} download className="text-sm font-semibold text-brand-700 underline-offset-4 hover:underline">
          Download the Excel template
        </a>
      </div>
      <p className="text-sm text-muted">
        Only have a PDF?{" "}
        <label className="relative inline cursor-pointer font-semibold text-brand-700 underline-offset-4 hover:underline">
          Upload the PDF instead
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              read(f);
            }}
          />
        </label>
        . Scanned copies are read with text recognition, which is slower; check every amount against the statements.
      </p>
      {msg && (
        <p role="status" className="text-sm text-ink">
          {msg}
        </p>
      )}
      {parsed && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-medium text-ink">
              Amounts in the statements are in
              <select value={scale} onChange={(e) => setScale(Number(e.target.value))} className={inputClass}>
                <option value={1}>Birr</option>
                <option value={1000}>Birr &apos;000</option>
                <option value={1000000}>Birr million</option>
              </select>
            </label>
            {parsed.columns.map((c, i) => (
              <label key={i} className="block text-sm font-medium text-ink">
                Put {c.label || `column ${i + 1}`} in
                <select value={slots[i]} onChange={(e) => setSlots(slots.map((s, j) => (j === i ? Number(e.target.value) : s)))} className={inputClass}>
                  <option value={-1}>Do not use</option>
                  {Array.from({ length: PERIODS }, (_, p) => (
                    <option key={p} value={p}>
                      {p === 0 ? "Latest period" : `Period ${p + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-2 py-2">Statement line</th>
                  {parsed.columns.map((c, i) => (
                    <th key={i} className="px-2 py-2 text-right">
                      {c.label || `Column ${i + 1}`}
                    </th>
                  ))}
                  <th className="px-2 py-2">Goes to</th>
                </tr>
              </thead>
              <tbody>
                {parsed.rows.map((r, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-2 py-1.5">{r.label}</td>
                    {r.values.map((v, j) => (
                      <td key={j} className="px-2 py-1.5 text-right tabular-nums">
                        {fmt(v)}
                      </td>
                    ))}
                    <td className="px-2 py-1">
                      <select aria-label={`Form line for ${r.label}`} value={r.target} onChange={(e) => setTarget(i, e.target.value as LineId | "")} className="w-full min-w-48 rounded-md border border-line bg-white px-2 py-1 text-sm">
                        <option value="">Ignore</option>
                        {lineOptions.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsed.checks.length > 0 && (
            <p className="text-xs text-muted">
              Totals in the statements, to check against the Outcomes step:{" "}
              {parsed.checks
                .filter((c, i, all) => all.findIndex((x) => x.label === c.label) === i)
                .map((c) => `${c.label} ${c.values.map(fmt).join(" / ")}`)
                .join("; ")}
              .
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={apply} className="rounded-full bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700">
              Put the figures into the form
            </button>
            <button type="button" onClick={() => setParsed(null)} className={`${smallButton} bg-white`}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
