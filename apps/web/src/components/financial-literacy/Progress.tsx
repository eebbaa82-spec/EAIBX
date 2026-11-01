"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { courseCopy, courseHref, courseModules, type CourseLocale } from "@/data/financial-literacy";

/**
 * Completed modules are remembered in this browser only (no account needed).
 * Storage can be blocked or cleared, so every read and write is guarded and
 * the pages work the same without it.
 */
const KEY = "investopia-financial-literacy-done";
const EVENT = "investopia-fl-progress";

function readDone(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeDone(ids: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable: progress simply is not remembered.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useDone() {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setDone(readDone());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return done;
}

export function markDone(id: string) {
  const ids = readDone();
  if (!ids.includes(id)) writeDone([...ids, id]);
}

export function ProgressBar({ locale }: { locale: CourseLocale }) {
  const t = courseCopy[locale];
  const done = useDone();
  const total = courseModules.length;
  const count = courseModules.filter((m) => done.includes(m.id)).length;
  const next = courseModules.find((m) => !done.includes(m.id)) ?? courseModules[0];
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Link href={courseHref(locale, next.slug)} className="rounded-lg bg-gold-400 px-5 py-3 font-semibold text-ink hover:bg-gold-500">
        {count > 0 ? t.continue : t.start}
      </Link>
      <div className="min-w-48 flex-1">
        <div className="h-2 overflow-hidden rounded-full bg-white/20" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={count}>
          <div className="h-full rounded-full bg-gold-400 transition-all duration-700" style={{ width: `${(count / total) * 100}%` }} />
        </div>
        <p className="mt-1 text-sm text-brand-100">{t.progress(count, total)}</p>
      </div>
    </div>
  );
}

export function DoneBadge({ id, locale }: { id: string; locale: CourseLocale }) {
  const done = useDone();
  if (!done.includes(id)) return null;
  return <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">✓ {courseCopy[locale].done}</span>;
}
