"use client";

import { mainSite } from "@/lib/site";
import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { courseCopy, type CourseLocale } from "@/data/financial-literacy";
import { HoneypotField, liveHost, sendForm, startRobotCheck } from "@/components/forms";

/**
 * The course is free, but learners register once (name, occupation,
 * education, email, mobile) so Erudite Africa can keep them on its mailing list.
 * Registrations go to submit.php as the "course" form. Being registered is
 * remembered in this browser; if storage is blocked it lasts for the visit.
 */
const KEY = "investopia-financial-literacy-registered";
let registeredThisVisit = false;

function isRegistered() {
  if (registeredThisVisit) return true;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function rememberRegistered() {
  registeredThisVisit = true;
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // Storage unavailable: the visitor stays registered for this visit only.
  }
}

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

export function CourseGate({ locale, children }: { locale: CourseLocale; children: ReactNode }) {
  const [registered, setRegistered] = useState<boolean | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setRegistered(isRegistered()), 0);
    return () => clearTimeout(t);
  }, []);
  if (registered === null) return <div className="min-h-64" aria-busy="true" />;
  if (registered) return <>{children}</>;
  return <SignupForm locale={locale} onDone={() => setRegistered(true)} />;
}

/** On the course overview: the same form, shown until the visitor has registered. */
export function OverviewSignup({ locale }: { locale: CourseLocale }) {
  const [registered, setRegistered] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setRegistered(isRegistered()), 0);
    return () => clearTimeout(t);
  }, []);
  if (registered) return null;
  return (
    <div id="register" className="bg-white pt-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SignupForm locale={locale} onDone={() => setRegistered(true)} scroll={false} />
      </div>
    </div>
  );
}

function SignupForm({ locale, onDone, scroll = true }: { locale: CourseLocale; onDone: () => void; scroll?: boolean }) {
  const t = courseCopy[locale].signup;
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.set("language", locale === "am" ? "Amharic" : "English");
    data.set("page", window.location.pathname);
    if (liveHost()) {
      setState("sending");
      try {
        await sendForm("course", data);
      } catch {
        setState("error");
        return;
      }
    }
    rememberRegistered();
    onDone();
    if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section aria-labelledby="signup-title" className="rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
      <h2 id="signup-title" className="text-2xl font-bold text-brand-900">
        {t.title}
      </h2>
      <p className="mt-2 text-muted">{t.intro}</p>
      <form onSubmit={onSubmit} onFocus={startRobotCheck} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-ink sm:col-span-2">
          {t.name}
          <input name="name" type="text" required maxLength={120} autoComplete="name" className={inputClass} />
        </label>
        <label className="block text-sm font-semibold text-ink">
          {t.occupation}
          <input
            name="occupation"
            type="text"
            required
            maxLength={120}
            autoComplete="organization-title"
            placeholder={t.occupationHint}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-semibold text-ink">
          {t.education}
          <select name="education" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              {t.choose}
            </option>
            {t.levels.map((level, i) => (
              // The English label is stored, so the mailing list reads the same for both languages.
              <option key={level} value={courseCopy.en.signup.levels[i]}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-ink">
          {t.email}
          <input name="email" type="email" required maxLength={160} autoComplete="email" className={inputClass} />
        </label>
        <label className="block text-sm font-semibold text-ink">
          {t.phone}
          <input
            name="mobile"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            pattern="^\+?[0-9 ]{9,16}$"
            placeholder={t.phoneHint}
            className={inputClass}
          />
        </label>
        <label className="flex gap-3 text-sm text-ink sm:col-span-2">
          <input name="consent" type="checkbox" value="yes" required className="mt-1 h-4 w-4 shrink-0 accent-brand-600" />
          <span>{t.consent}</span>
        </label>
        <HoneypotField />
        {state === "error" && (
          <p role="alert" className="text-sm text-red-700 sm:col-span-2">
            {t.error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <button
            type="submit"
            disabled={state === "sending"}
            className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {state === "sending" ? t.sending : t.submit}
          </button>
          <Link href={mainSite("/legal/privacy/")} className="text-sm text-brand-700 underline">
            {t.privacy}
          </Link>
        </div>
      </form>
    </section>
  );
}
