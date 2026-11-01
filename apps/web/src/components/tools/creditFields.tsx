"use client";

import type { ReactNode } from "react";

/** Small form pieces shared by the credit analysis workspace. */

export const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";
export const labelClass = "block text-sm font-medium text-ink";
export const smallButton = "rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-brand-700 hover:border-brand-500";
const cellClass = "w-full min-w-24 rounded-md border border-line bg-white px-2 py-1.5 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

export function Text({ label, value, onChange, hint, type = "text", wide, placeholder }: { label: string; value: string; onChange: (v: string) => void; hint?: string; type?: string; wide?: boolean; placeholder?: string }) {
  return (
    <label className={`${labelClass} ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

export function Area({ label, value, onChange, hint, rows = 4, placeholder }: { label: string; value: string; onChange: (v: string) => void; hint?: ReactNode; rows?: number; placeholder?: string }) {
  return (
    <label className={`${labelClass} sm:col-span-2`}>
      {label}
      <textarea value={value} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

export function Pick({ label, value, onChange, options, wide, hint }: { label: string; value: string; onChange: (v: string) => void; options: (string | { value: string; label: string })[]; wide?: boolean; hint?: string }) {
  return (
    <label className={`${labelClass} ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o || "Select" } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

export function Check({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 text-sm text-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600" />
      <span>{label}</span>
    </label>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function Block({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="min-w-0 space-y-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
      <legend className="px-1 text-lg font-bold text-ink">{title}</legend>
      {intro && <p className="text-sm text-muted">{intro}</p>}
      {children}
    </fieldset>
  );
}

export type Col<T> = { key: keyof T & string; label: string; type?: "text" | "number" | "date" | "select"; options?: string[]; width?: string };

/** An editable table: one row per item, add and remove rows. */
export function TableEditor<T extends Record<string, string>>({ rows, onChange, cols, blank, addLabel }: { rows: T[]; onChange: (rows: T[]) => void; cols: Col<T>[]; blank: T; addLabel: string }) {
  const set = (i: number, key: keyof T, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  return (
    <div className="space-y-2">
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
              <tr>
                {cols.map((c) => (
                  <th key={c.key} className={`px-2 py-2 font-semibold ${c.width ?? ""}`}>
                    {c.label}
                  </th>
                ))}
                <th className="px-2 py-2" aria-label="Remove" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-line align-top">
                  {cols.map((c) => (
                    <td key={c.key} className="px-2 py-1.5">
                      {c.type === "select" ? (
                        <select aria-label={c.label} value={r[c.key]} onChange={(e) => set(i, c.key, e.target.value)} className={cellClass}>
                          {(c.options ?? []).map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          aria-label={c.label}
                          type={c.type === "date" ? "date" : "text"}
                          inputMode={c.type === "number" ? "decimal" : undefined}
                          value={r[c.key]}
                          onChange={(e) => set(i, c.key, e.target.value)}
                          className={cellClass}
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-2 py-1.5">
                    <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="px-1 py-1.5 text-sm font-semibold text-red-700 hover:underline" aria-label="Remove row">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button type="button" onClick={() => onChange([...rows, { ...blank }])} className={smallButton}>
        + {addLabel}
      </button>
    </div>
  );
}

/** The analyst's own input, asked for on every step. */
export function AnythingToAdd({ value, onChange, what = "this section" }: { value: string; onChange: (v: string) => void; what?: string }) {
  return (
    <div className="rounded-2xl border border-gold-400 bg-gold-100 p-5">
      <p className="font-semibold text-ink">Do you have anything to add to {what}?</p>
      <p className="mt-1 text-sm text-muted">
        Field findings, information from the borrower, or more recent figures than the ones shown. It goes into the report as your own note. You can attach documents on the
        Recommendation step.
      </p>
      <textarea aria-label={`Analyst's note on ${what}`} value={value} rows={3} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </div>
  );
}
