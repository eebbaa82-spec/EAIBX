"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const KEY = "kena-cookie-choice";
const listeners = new Set<() => void>();
let dismissedThisVisit = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function hasChosen() {
  if (dismissedThisVisit) return true;
  try {
    return Boolean(window.localStorage.getItem(KEY));
  } catch {
    return false;
  }
}

function choose(value: "all" | "essential") {
  dismissedThisVisit = true;
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // Storage can be unavailable (private mode); hiding for this visit is enough.
  }
  listeners.forEach((l) => l());
}

export function CookieBanner() {
  // On the server, treat the choice as made so the banner never flashes in the HTML.
  const chosen = useSyncExternalStore(subscribe, hasChosen, () => true);
  if (chosen) return null;

  return (
    <div role="region" aria-label="Cookie consent" className="fixed inset-x-0 bottom-0 z-50 p-4 print:hidden">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-xl border border-line bg-white p-5 shadow-xl md:flex-row md:items-center">
        <p className="flex-1 text-sm text-ink">
          We use cookies to keep you signed in, remember your language and understand how Kena is used. You choose what we can use.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button type="button" onClick={() => choose("all")} className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">
            Accept all
          </button>
          <button type="button" onClick={() => choose("essential")} className="rounded-lg border border-brand-600 px-4 py-2 font-semibold text-brand-700">
            Only essential
          </button>
          <Link href="/legal/cookies" className="italic text-muted underline">
            Manage preferences
          </Link>
        </div>
      </div>
    </div>
  );
}
