"use client";

import { useEffect, useState, type FormEvent } from "react";
import { liveHost } from "@/components/forms";

/**
 * Looks a certificate number up on Investopia's register (certificate.php on
 * the live host). The QR code on a certificate opens this page with ?id=.
 */
type Found = { id: string; name: string; course: string; score: number; issued: string };
type State = { status: "idle" | "checking" | "offline" | "error" } | { status: "found"; record: Found } | { status: "missing"; id: string };

const longDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function VerifyCertificate() {
  const [id, setId] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function check(raw: string) {
    const number = raw.trim().toUpperCase().replace(/\s+/g, "");
    if (!number) return;
    if (!liveHost()) {
      setState({ status: "offline" });
      return;
    }
    setState({ status: "checking" });
    try {
      const res = await fetch(`/api/certificate.php?id=${encodeURIComponent(number)}`, { cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; found?: boolean } & Partial<Found>;
      if (!res.ok || !body.ok) throw new Error("lookup failed");
      setState(body.found ? { status: "found", record: body as Found } : { status: "missing", id: number });
    } catch {
      setState({ status: "error" });
    }
  }

  useEffect(() => {
    const fromLink = new URLSearchParams(window.location.search).get("id") ?? "";
    if (!fromLink) return;
    const t = setTimeout(() => {
      setId(fromLink);
      void check(fromLink);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void check(id);
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
        <label className="block min-w-72 flex-1 text-sm font-semibold text-ink">
          Certificate number
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            autoComplete="off"
            spellCheck={false}
            placeholder="INV/ACAD/T-2C/2026/ABCD2345"
            className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 font-mono uppercase text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </label>
        <button type="submit" disabled={state.status === "checking"} className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {state.status === "checking" ? "Checking..." : "Check"}
        </button>
      </form>

      <div aria-live="polite" className="mt-6">
        {state.status === "found" && (
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <p className="text-lg font-bold text-brand-700">✓ Genuine certificate</p>
            <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-[10rem_1fr]">
              <dt className="font-semibold text-ink">Awarded to</dt>
              <dd className="text-ink">{state.record.name}</dd>
              <dt className="font-semibold text-ink">Course</dt>
              <dd className="text-ink">{state.record.course}</dd>
              <dt className="font-semibold text-ink">Exam score</dt>
              <dd className="text-ink">{state.record.score}%</dd>
              <dt className="font-semibold text-ink">Issued</dt>
              <dd className="text-ink">{longDate(state.record.issued)}</dd>
              <dt className="font-semibold text-ink">Certificate no.</dt>
              <dd className="font-mono text-ink">{state.record.id}</dd>
            </dl>
            <p className="mt-4 text-sm text-muted">Check that these details match the certificate in front of you.</p>
          </div>
        )}
        {state.status === "missing" && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-lg font-bold text-red-800">No certificate with this number</p>
            <p className="mt-2 text-ink">
              <span className="font-mono">{state.id}</span> is not on Investopia&apos;s register. Check the number for typing errors. If it is correct, the
              certificate is not genuine; please tell us at investopia@eruditeafrica.com.
            </p>
          </div>
        )}
        {state.status === "offline" && (
          <p className="rounded-2xl border border-line bg-white p-6 text-ink">
            Certificates are checked on investopia.et. This preview copy of the site has no register, so it cannot confirm a number.
          </p>
        )}
        {state.status === "error" && (
          <p role="alert" className="rounded-2xl border border-line bg-white p-6 text-ink">
            The check could not be completed just now. Please try again in a moment.
          </p>
        )}
      </div>
    </div>
  );
}
