"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { translator } from "@/i18n/chrome";
import type { Locale } from "@/i18n/config";

/**
 * The platform back end (NestJS API) is not built yet, so forms do not send
 * anything. On submit they show the copy's confirmation message together with
 * a clear preview notice.
 */
function PreviewNotice({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
      <p>{children}</p>
      <p className="mt-2 text-xs text-muted">Preview only: this form is not connected yet, so nothing was sent.</p>
    </div>
  );
}

export type Field = {
  name: string;
  label: ReactNode;
  type?: "text" | "email" | "tel" | "password" | "textarea" | "select" | "date" | "file" | "checkbox";
  options?: string[];
  helper?: string;
  required?: boolean;
  placeholder?: string;
};

export function PreviewForm({
  fields,
  submitLabel,
  confirmation,
  className = "",
}: {
  fields: Field[];
  submitLabel: string;
  confirmation: ReactNode;
  className?: string;
}) {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) return <PreviewNotice>{confirmation}</PreviewNotice>;

  const inputClass =
    "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-ink focus:border-brand-500 focus:outline-none";

  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {fields.map((field) => {
        const id = `f-${field.name}`;
        if (field.type === "checkbox") {
          return (
            <label key={field.name} htmlFor={id} className="flex items-start gap-2 text-sm text-ink">
              <input id={id} name={field.name} type="checkbox" required={field.required} className="mt-1" />
              <span>{field.label}</span>
            </label>
          );
        }
        return (
          <div key={field.name}>
            <label htmlFor={id} className="block text-sm font-medium text-ink">
              {field.label}
              {!field.required && field.type !== "file" && <span className="font-normal text-muted"> (optional)</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea id={id} name={field.name} rows={4} required={field.required} placeholder={field.placeholder} className={inputClass} />
            ) : field.type === "select" ? (
              <select id={id} name={field.name} required={field.required} className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select one
                </option>
                {field.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                name={field.name}
                type={field.type ?? "text"}
                required={field.required}
                placeholder={field.placeholder}
                className={inputClass}
              />
            )}
            {field.helper && <p className="mt-1 text-xs text-muted">{field.helper}</p>}
          </div>
        );
      })}
      <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
        {submitLabel}
      </button>
    </form>
  );
}

export function NewsletterForm({ locale = "en" }: { locale?: Locale }) {
  const t = translator(locale);
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <p role="status" className="text-sm text-brand-100">
        {t("Thanks for subscribing. (Preview only: not connected yet.)")}
      </p>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="w-full max-w-md"
    >
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          {t("Email address")}
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none"
        />
        <button type="submit" className="rounded-lg bg-gold-500 px-4 py-2 font-semibold text-ink hover:bg-gold-400">
          {t("Subscribe")}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400">{t("No spam. Unsubscribe any time.")}</p>
    </form>
  );
}
