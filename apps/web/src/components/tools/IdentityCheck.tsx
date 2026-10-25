"use client";

import { useEffect, useState, type FormEvent } from "react";
import { HoneypotField, liveHost, sendForm, startRobotCheck } from "@/components/forms";

/**
 * Business identity check for the borrower profile builder. The bank-ready pack
 * is only for the business itself or someone it has authorized, so before the
 * pack opens the requester:
 * 1. gives the business's TIN and trade licence and their own name, role and ID,
 * 2. checks the business on the Ministry of Trade register (etrade.et),
 * 3. sends the request; the Kenna Ventures team checks the register and the
 *    documents the requester emails, then sends a one-time verification code,
 * 4. enters the code, which identity.php ties to that TIN for good.
 * The verified TIN is remembered in this browser; changing the profile's TIN
 * locks the pack again.
 */
export type Identity = {
  requester: string;
  role: string;
  idNumber: string;
  business: string;
  tin: string;
  licence: string;
  email: string;
  mobile: string;
  checked: boolean;
  status: "draft" | "sent" | "verified";
  verifiedOn?: string;
};

const KEY = "investopia-borrower-identity";
const EVENT = "investopia-borrower-identity";
export const ETRADE_URL = "https://etrade.et/";

const empty = (): Identity => ({
  requester: "",
  role: "",
  idNumber: "",
  business: "",
  tin: "",
  licence: "",
  email: "",
  mobile: "",
  checked: false,
  status: "draft",
});

let visit: Identity | null = null;

function read(): Identity {
  if (visit) return visit;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...empty(), ...(JSON.parse(raw) as Partial<Identity>) } : empty();
  } catch {
    return empty();
  }
}

function write(id: Identity) {
  visit = id;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(id));
  } catch {
    // Storage unavailable: kept for this visit only.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useIdentity() {
  const [id, setId] = useState<Identity>(empty);
  useEffect(() => {
    const sync = () => setId(read());
    const t = setTimeout(sync, 0);
    window.addEventListener(EVENT, sync);
    return () => {
      clearTimeout(t);
      window.removeEventListener(EVENT, sync);
    };
  }, []);
  return id;
}

/** A TIN is 10 digits; people often type it with spaces or dashes. */
export const cleanTin = (tin: string) => tin.replace(/\D/g, "");

/** True when the business was verified and the profile still carries its TIN. */
export const identityVerified = (id: Identity, profileTin: string) =>
  id.status === "verified" && cleanTin(id.tin) !== "" && cleanTin(id.tin) === cleanTin(profileTin);

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-canvas";
const labelClass = "block text-sm font-semibold text-ink";
const roles = ["Owner or shareholder", "General manager", "Authorized representative (with a letter or power of attorney)"];

export function IdentityStep({
  isBusiness,
  profileTin,
  onApply,
}: {
  isBusiness: boolean;
  profileTin: string;
  onApply: (v: { name: string; tin: string; licence: string; email: string; phone: string }) => void;
}) {
  const saved = useIdentity();
  const [draft, setDraft] = useState<Identity | null>(null);
  const id = draft ?? saved;
  const [state, setState] = useState<{ busy: boolean; error?: string }>({ busy: false });
  const [code, setCode] = useState("");
  const live = liveHost();
  const locked = id.status !== "draft";
  const set = (patch: Partial<Identity>) => setDraft({ ...id, ...patch });
  const tinOk = /^\d{10}$/.test(cleanTin(id.tin));

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tinOk) {
      setState({ busy: false, error: "Enter the 10-digit TIN" });
      return;
    }
    const next: Identity = { ...id, tin: cleanTin(id.tin), status: "sent" };
    if (live) {
      setState({ busy: true });
      const data = new FormData(e.currentTarget);
      data.set("tin", next.tin);
      data.set("etrade_checked", "yes");
      data.set("page", window.location.pathname);
      try {
        await sendForm("identity", data);
      } catch {
        setState({ busy: false, error: "Sorry, that didn't go through. Please check your details and try again" });
        return;
      }
    }
    write(next);
    setDraft(null);
    setState({ busy: false });
    onApply({ name: next.business, tin: next.tin, licence: next.licence, email: next.email, phone: next.mobile });
  }

  async function verify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ busy: true });
    const data = new FormData();
    data.set("tin", cleanTin(id.tin));
    data.set("code", code.trim());
    try {
      const body = await sendForm("identity-code", data, "/api/identity.php");
      write({ ...id, status: "verified", verifiedOn: String(body.verified ?? new Date().toISOString().slice(0, 10)) });
      setDraft(null);
      setState({ busy: false });
      onApply({ name: id.business, tin: cleanTin(id.tin), licence: id.licence, email: id.email, phone: id.mobile });
    } catch (err) {
      setState({ busy: false, error: err instanceof Error ? err.message : "The code could not be checked" });
    }
  }

  if (id.status === "verified") {
    const mismatch = cleanTin(profileTin) !== "" && cleanTin(profileTin) !== cleanTin(id.tin);
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
        <p className="text-lg font-bold text-brand-700">✓ Business identity verified</p>
        <p className="mt-2 text-ink">
          {id.business} · TIN {id.tin}
          {id.licence ? ` · Licence ${id.licence}` : ""}. Requested by {id.requester} ({id.role.split(" (")[0].toLowerCase()}), verified by Kenna Ventures
          {id.verifiedOn ? ` on ${id.verifiedOn}` : ""} against the Ministry of Trade register.
        </p>
        {mismatch && (
          <p role="alert" className="mt-3 font-semibold text-red-700">
            The TIN in your profile ({profileTin}) is not the verified TIN. The bank-ready pack opens only for the verified business.
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Start a new identity check for a different business? The current verification is removed from this device.")) write(empty());
          }}
          className="mt-4 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          Verify a different business
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={send} onFocus={live ? startRobotCheck : undefined} className="grid gap-4 sm:grid-cols-2">
        <fieldset className="contents" disabled={locked}>
          <label className={labelClass}>
            Your full name
            <input name="requester" required maxLength={120} autoComplete="name" value={id.requester} onChange={(e) => set({ requester: e.target.value })} className={inputClass} />
          </label>
          <label className={labelClass}>
            Your role in the business
            <select name="role" required value={id.role} onChange={(e) => set({ role: e.target.value })} className={inputClass}>
              <option value="" disabled>
                Select one
              </option>
              {(isBusiness ? roles : ["The borrower", roles[2]]).map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Your national ID (Fayda) or passport number
            <input name="id_number" required maxLength={40} autoComplete="off" value={id.idNumber} onChange={(e) => set({ idNumber: e.target.value })} className={inputClass} />
          </label>
          <label className={labelClass}>
            {isBusiness ? "Business name, as registered" : "Borrower's full name, as registered"}
            <input name="business" required maxLength={160} value={id.business} onChange={(e) => set({ business: e.target.value })} className={inputClass} />
          </label>
          <label className={labelClass}>
            Tax Identification Number (TIN)
            <input name="tin" required inputMode="numeric" maxLength={14} placeholder="10 digits" value={id.tin} onChange={(e) => set({ tin: e.target.value })} className={inputClass} />
          </label>
          {isBusiness && (
            <label className={labelClass}>
              Business licence number
              <input name="licence" required maxLength={60} value={id.licence} onChange={(e) => set({ licence: e.target.value })} className={inputClass} />
            </label>
          )}
          <label className={labelClass}>
            Email address
            <input name="email" type="email" required maxLength={160} autoComplete="email" value={id.email} onChange={(e) => set({ email: e.target.value })} className={inputClass} />
          </label>
          <label className={labelClass}>
            Mobile number
            <input name="mobile" type="tel" required pattern="^\+?[0-9 ]{9,16}$" placeholder="0911 234 567" autoComplete="tel" value={id.mobile} onChange={(e) => set({ mobile: e.target.value })} className={inputClass} />
          </label>

          <div className="rounded-xl bg-canvas p-5 text-sm text-ink sm:col-span-2">
            <p className="font-semibold">Check the business on the Ministry of Trade register</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
              <li>
                Open{" "}
                <a href={ETRADE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline">
                  etrade.et
                </a>{" "}
                and find &ldquo;Search Existing Business&rdquo;.
              </li>
              <li>Enter the TIN or the business licence number.</li>
              <li>Check that the name matches and the licence is valid or renewed for this year.</li>
            </ol>
            <label className="mt-3 flex gap-3">
              <input type="checkbox" required checked={id.checked} onChange={(e) => set({ checked: e.target.checked })} className="mt-1 h-4 w-4 shrink-0 accent-brand-600" />
              <span>
                I checked etrade.et: the name and licence match, the licence is current, and I am the {isBusiness ? "owner, manager or an authorized representative of this business" : "borrower or their authorized representative"}.
              </span>
            </label>
            <label className="mt-3 flex gap-3">
              <input name="consent" type="checkbox" value="yes" required className="mt-1 h-4 w-4 shrink-0 accent-brand-600" />
              <span>I agree that Kenna Ventures may check these details against the Ministry of Trade register and contact me about them.</span>
            </label>
          </div>
          <HoneypotField />
        </fieldset>
        {!locked && (
          <div className="sm:col-span-2">
            <button type="submit" disabled={state.busy} className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {state.busy ? "Sending..." : "Send for verification"}
            </button>
          </div>
        )}
      </form>

      {locked && (
        <div className="rounded-2xl border border-gold-400 bg-gold-100 p-6">
          <p className="text-lg font-bold text-ink">Request sent: next steps</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink">
            <li>
              Email these to info@kenna.et with TIN {id.tin} in the subject: the renewed trade licence, your ID
              {isBusiness ? ", and if you are a representative, the authorization letter or power of attorney" : ""}.
            </li>
            <li>The Kenna Ventures team checks the business on the Ministry of Trade register and that you may act for it.</li>
            <li>You receive a verification code by email. Enter it below to open the bank-ready pack.</li>
          </ol>
          {live ? (
            <form onSubmit={verify} onFocus={startRobotCheck} className="mt-5 flex flex-wrap items-end gap-3">
              <label className="block min-w-64 text-sm font-semibold text-ink">
                Verification code
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="INV-ID-XXXXX-XXXXX"
                  className={`${inputClass} font-mono uppercase`}
                />
              </label>
              <button type="submit" disabled={state.busy} className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                {state.busy ? "Checking..." : "Verify"}
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-muted">This is the preview site: requests are not sent and codes can only be checked on kenna.et.</p>
          )}
          <button
            type="button"
            onClick={() => {
              write({ ...id, status: "draft" });
              setDraft(null);
            }}
            className="mt-4 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
          >
            Change the details
          </button>
        </div>
      )}
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}.
        </p>
      )}
    </div>
  );
}
