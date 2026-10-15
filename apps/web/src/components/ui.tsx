import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Marks copy that still needs a real fact before launch. Rendered visibly so
 * no placeholder can slip into production unnoticed.
 */
export function Tbc({ children }: { children?: ReactNode }) {
  return (
    <mark
      className="rounded border border-dashed border-gold-500 bg-gold-100 px-1 text-[0.9em] font-medium text-ink"
      title="To be confirmed before launch"
    >
      [TBC{children ? <>: {children}</> : null}]
    </mark>
  );
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "light";
  className?: string;
};

const buttonStyles = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "border border-brand-600 text-brand-700 hover:bg-brand-50",
  ghost: "text-brand-700 underline-offset-4 hover:underline",
  light: "bg-white text-brand-700 hover:bg-brand-50",
};

export function ButtonLink({ href, children, variant = "primary", className = "" }: ButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${buttonStyles[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = "white",
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  tone?: "white" | "canvas" | "brand";
}) {
  const toneClass =
    tone === "canvas" ? "bg-canvas" : tone === "brand" ? "bg-brand-900 text-white" : "bg-white";
  return (
    <section id={id} className={`${toneClass} scroll-mt-20 py-16 sm:py-20`}>
      <Container>
        {(eyebrow || title || intro) && (
          <div className="mb-10 max-w-3xl">
            {eyebrow && (
              <p className={`mb-2 text-sm font-semibold uppercase tracking-wide ${tone === "brand" ? "text-gold-400" : "text-brand-600"}`}>
                {eyebrow}
              </p>
            )}
            {title && <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>}
            {intro && (
              <div className={`mt-3 text-lg ${tone === "brand" ? "text-brand-100" : "text-muted"}`}>{intro}</div>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}

export function PageHero({
  eyebrow,
  title,
  subhead,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  subhead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 py-16 text-white sm:py-24">
      <Container>
        <div className="max-w-3xl">
          {eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold-400">{eyebrow}</p>}
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          {subhead && <div className="mt-5 text-lg text-brand-100 sm:text-xl">{subhead}</div>}
          {children && <div className="mt-8 flex flex-wrap items-center gap-3">{children}</div>}
        </div>
      </Container>
    </section>
  );
}

export function Card({
  title,
  children,
  footer,
  className = "",
}: {
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col rounded-xl border border-line bg-white p-6 shadow-sm ${className}`}>
      {title && <h3 className="text-lg font-semibold text-ink">{title}</h3>}
      {children && <div className="mt-2 flex-1 text-muted">{children}</div>}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

export function CardGrid({ children, cols = 3 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  const colClass = cols === 2 ? "md:grid-cols-2" : cols === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3";
  return <div className={`grid gap-6 ${colClass}`}>{children}</div>;
}

export function Steps({ steps }: { steps: { title: string; body?: ReactNode }[] }) {
  return (
    <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, i) => (
        <li key={step.title} className="relative rounded-xl border border-line bg-white p-6">
          <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            {i + 1}
          </span>
          <h3 className="font-semibold text-ink">{step.title}</h3>
          {step.body && <p className="mt-1 text-muted">{step.body}</p>}
        </li>
      ))}
    </ol>
  );
}

export function FeatureList({ items }: { items: { title: string; body: ReactNode }[] }) {
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {items.map((item) => (
        <li key={item.title} className="flex gap-3">
          <span aria-hidden className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full bg-gold-500" />
          <p>
            <strong className="font-semibold text-ink">{item.title}</strong>{" "}
            <span className="text-muted">{item.body}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

export function TagList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-full border border-line bg-white px-3 py-1 text-sm text-ink">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function DataTable({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="bg-canvas text-ink">
          <tr>
            {head.map((h, i) => (
              <th key={i} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-white">
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className={`px-4 py-3 align-top ${c === 0 ? "font-medium text-ink" : "text-muted"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Shown where a list will be filled from the platform once the back end exists. */
export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-canvas p-8 text-center text-muted">
      <p>{children}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-lg bg-canvas p-4 text-sm text-muted">{children}</p>;
}

export function CtaBand({ title, body, children }: { title: ReactNode; body?: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-brand-900 py-16 text-white">
      <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
          {body && <p className="mt-2 text-brand-100">{body}</p>}
        </div>
        <div className="flex flex-wrap gap-3">{children}</div>
      </Container>
    </section>
  );
}

export function TrustBar() {
  return (
    <div className="border-y border-line bg-canvas py-4">
      <Container>
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-muted">
          <li>Verified profiles</li>
          <li>Secure deal rooms</li>
          <li>
            Data hosted to <Tbc>hosting standard</Tbc>
          </li>
          <li>Built in Ethiopia for Ethiopia</li>
        </ul>
      </Container>
    </div>
  );
}

export function Faq({ items }: { items: { q: string; a: ReactNode }[] }) {
  return (
    <div className="divide-y divide-line rounded-xl border border-line bg-white">
      {items.map((item) => (
        <details key={item.q} className="group p-5">
          <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden">
            <span className="flex items-center justify-between gap-4">
              {item.q}
              <span aria-hidden className="text-brand-600 transition-transform group-open:rotate-45">
                +
              </span>
            </span>
          </summary>
          <div className="mt-3 text-muted">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
