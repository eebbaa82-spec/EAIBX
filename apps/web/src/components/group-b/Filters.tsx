import type { ReactNode } from "react";

/**
 * Static preview of a filter panel. The listings come from the platform, which
 * is not connected yet, so these controls show the options but do nothing.
 */
export function FilterPanel({ children, label = "Filters" }: { children: ReactNode; label?: string }) {
  return (
    <div role="group" aria-label={label} className="rounded-xl border border-line bg-white p-6">
      <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-600">{label}</p>
      <div className="space-y-5">{children}</div>
      <p className="mt-5 text-xs text-muted">Preview only: filters will work once listings go live.</p>
    </div>
  );
}

export function FilterGroup({ title, options, helper }: { title: string; options?: string[]; helper?: ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {options && options.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {options.map((o) => (
            <li key={o} className="rounded-full border border-line bg-canvas px-3 py-1 text-sm text-muted">
              {o}
            </li>
          ))}
        </ul>
      )}
      {helper && <p className="mt-1 text-xs text-muted">{helper}</p>}
    </div>
  );
}

/** Non-functional tab row, e.g. listing types. First item shown as selected. */
export function StaticTabs({ items, label }: { items: string[]; label: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2 border-b border-line pb-3">
      {items.map((item, i) => (
        <li
          key={item}
          aria-current={i === 0 ? "true" : undefined}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${i === 0 ? "bg-brand-600 text-white" : "text-muted"}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Describes the fields a platform card will show, without inventing an entry. */
export function CardAnatomy({ title, fields }: { title: string; fields: string[] }) {
  return (
    <div className="rounded-xl border border-line bg-canvas p-5">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-muted">{fields.join(" · ")}</p>
    </div>
  );
}
