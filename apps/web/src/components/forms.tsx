"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { translator } from "@/i18n/chrome";
import type { Locale } from "@/i18n/config";

/**
 * The platform back end (NestJS API) is not built yet. Forms given a
 * `formName` post to /api/submit.php on the live host, which emails the
 * submission to the Investopia inbox. Everywhere else (the preview site, and
 * forms that need a member account) they show the copy's confirmation message
 * together with a clear preview notice.
 */
const SUBMIT_URL = "/api/submit.php";

function liveHost() {
  return typeof window !== "undefined" && /(^|\.)investopia\.et$/.test(window.location.hostname);
}

async function sendForm(formName: string, data: FormData) {
  data.set("form", formName);
  const res = await fetch(SUBMIT_URL, { method: "POST", body: data });
  const body = (await res.json().catch(() => null)) as { ok?: boolean } | null;
  if (!res.ok || !body?.ok) throw new Error("Form not sent");
}

function SendError() {
  return (
    <p role="alert" className="text-sm text-red-700">
      Sorry, your message could not be sent. Please try again, or email us at{" "}
      <a className="underline" href="mailto:investopia@eruditeafrica.com">
        investopia@eruditeafrica.com
      </a>
      .
    </p>
  );
}
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
  formName,
  className = "",
}: {
  fields: Field[];
  submitLabel: string;
  confirmation: ReactNode;
  /** Set to send the form from the live site; leave out for account-only forms. */
  formName?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "preview" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formName || !liveHost()) {
      setState("preview");
      return;
    }
    setState("sending");
    try {
      await sendForm(formName, new FormData(e.currentTarget));
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "preview") return <PreviewNotice>{confirmation}</PreviewNotice>;
  if (state === "sent") {
    return (
      <div role="status" className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
        <p>{confirmation}</p>
      </div>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-ink focus:border-brand-500 focus:outline-none";

  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      <HoneypotField />
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
      {state === "error" && <SendError />}
      <button
        type="submit"
        disabled={state === "sending"}
        className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </form>
  );
}

/** Hidden from people; bots that fill it in are dropped by submit.php. */
function HoneypotField() {
  return (
    <div aria-hidden="true" className="hidden">
      <label>
        Leave this empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function NewsletterForm({ locale = "en" }: { locale?: Locale }) {
  const t = translator(locale);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "preview" | "error">("idle");
  if (state === "sent" || state === "preview") {
    return (
      <p role="status" className="text-sm text-brand-100">
        {state === "sent" ? t("Thanks for subscribing.") : t("Thanks for subscribing. (Preview only: not connected yet.)")}
      </p>
    );
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!liveHost()) {
          setState("preview");
          return;
        }
        setState("sending");
        try {
          await sendForm("newsletter", new FormData(e.currentTarget));
          setState("sent");
        } catch {
          setState("error");
        }
      }}
      className="w-full max-w-md"
    >
      <HoneypotField />
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          {t("Email address")}
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-lg bg-gold-500 px-4 py-2 font-semibold text-ink hover:bg-gold-400 disabled:opacity-60"
        >
          {t("Subscribe")}
        </button>
      </div>
      {state === "error" && <p role="alert" className="mt-2 text-sm text-gold-100">{t("Sorry, that didn't go through. Please try again.")}</p>}
      <p className="mt-2 text-xs text-slate-400">{t("No spam. Unsubscribe any time.")}</p>
    </form>
  );
}
