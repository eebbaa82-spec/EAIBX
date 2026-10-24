"use client";

import { academy, mainSite } from "@/lib/site";
import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { accessCodeHashes } from "@/data/academy/access";
import { HoneypotField, liveHost, sendForm, startRobotCheck } from "@/components/forms";
import { claimSeat, forgetSeat, isSeatCode, seatAllows, seatInfo, seatStillValid } from "./seat";

/**
 * Who may open Academy professional courses. Until member accounts and payments
 * run on the back end, access is decided in this browser:
 * - registered: signed up once (the Academy, the borrower profile builder or the
 *   free course all count). Opens the first module of every course as a preview.
 * - subscriber: entered an access code that Erudite issues after payment. Opens
 *   every module and the final exam. Staff of a subscribing bank enter the seat
 *   code their training department gave them instead (see seat.ts); it may
 *   open only the courses assigned to them.
 * Storage can be blocked; access then lasts for the visit.
 */
type Access = "loading" | "guest" | "registered" | "subscriber";

const MEMBER = "investopia-member-registered";
const COURSE = "investopia-financial-literacy-registered";
const SUBSCRIBER = "investopia-academy-subscriber";
const CODE = "investopia-academy-code";
const EVENT = "investopia-academy-access";
const visit: Record<string, boolean> = {};

function read(key: string) {
  if (visit[key]) return true;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function remember(key: string) {
  visit[key] = true;
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // Storage unavailable: remembered for this visit only.
  }
  window.dispatchEvent(new Event(EVENT));
}

function current(): Access {
  if (read(SUBSCRIBER)) return "subscriber";
  if (read(MEMBER) || read(COURSE)) return "registered";
  return "guest";
}

export function useAccess() {
  const [access, setAccess] = useState<Access>("loading");
  useEffect(() => {
    const sync = () => setAccess(current());
    const t = setTimeout(sync, 0);
    seatStillValid().then((valid) => {
      if (valid) return;
      // The training department revoked this seat: back to the free preview.
      delete visit[SUBSCRIBER];
      try {
        window.localStorage.removeItem(SUBSCRIBER);
        window.localStorage.removeItem(CODE);
      } catch {
        // Nothing stored.
      }
      forgetSeat();
      sync();
    });
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      clearTimeout(t);
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return access;
}

/** The access code entered on this device, needed to register a certificate. */
export function savedCode() {
  try {
    return window.localStorage.getItem(CODE) ?? "";
  } catch {
    return "";
  }
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";
const labelClass = "block text-sm font-semibold text-ink";

/** Shows its children to those allowed in: "preview" needs a registration, "full" a subscription. */
export function AcademyGate({ need, course, children }: { need: "preview" | "full"; course: string; children: ReactNode }) {
  const access = useAccess();
  if (access === "loading") return <div className="min-h-64" aria-busy="true" />;
  if (access === "subscriber" && !seatAllows(course)) return <NotAssigned />;
  if (access === "subscriber" || (need === "preview" && access === "registered")) return <>{children}</>;
  if (need === "preview") return <RegisterPanel />;
  return <SubscribePanel course={course} />;
}

function NotAssigned() {
  const seat = seatInfo();
  return (
    <section className="mt-8 rounded-2xl border border-gold-400 bg-gold-100 p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-ink">This course is not assigned to you</h2>
      <p className="mt-2 text-ink">
        Your Academy seat comes from {seat?.institution ?? "your institution"}, and its training department has assigned you specific courses. Ask them to
        add this one, or open your assigned courses from the{" "}
        <Link href="/academy/courses/" className="font-semibold text-brand-700 underline">
          course catalog
        </Link>
        .
      </p>
    </section>
  );
}

function Consent() {
  return (
    <label className="flex gap-3 text-sm text-ink sm:col-span-2">
      <input name="consent" type="checkbox" value="yes" required className="mt-1 h-4 w-4 shrink-0 accent-brand-600" />
      <span>
        I agree to Erudite Africa&apos;s{" "}
        <Link href={mainSite("/legal/terms/")} className="text-brand-700 underline">
          terms
        </Link>{" "}
        and{" "}
        <Link href={mainSite("/legal/privacy/")} className="text-brand-700 underline">
          privacy policy
        </Link>
        , and to be contacted about my registration and the Academy.
      </span>
    </label>
  );
}

function useSubmit(form: string, onDone: () => void) {
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.set("page", window.location.pathname);
    if (liveHost()) {
      setState("sending");
      try {
        await sendForm(form, data);
      } catch {
        setState("error");
        return;
      }
    }
    setState("idle");
    onDone();
  }
  return { state, onSubmit };
}

function Contact() {
  return (
    <>
      <label className={labelClass}>
        Full name
        <input name="name" type="text" required maxLength={120} autoComplete="name" className={inputClass} />
      </label>
      <label className={labelClass}>
        Bank, MFI or employer
        <input name="business" type="text" maxLength={160} autoComplete="organization" className={inputClass} />
      </label>
      <label className={labelClass}>
        Email address
        <input name="email" type="email" required maxLength={160} autoComplete="email" className={inputClass} />
      </label>
      <label className={labelClass}>
        Mobile number
        <input name="mobile" type="tel" required inputMode="tel" autoComplete="tel" pattern="^\+?[0-9 ]{9,16}$" placeholder="0911 234 567" className={inputClass} />
      </label>
    </>
  );
}

export function RegisterPanel() {
  const { state, onSubmit } = useSubmit("member", () => remember(MEMBER));
  return (
    <section aria-labelledby="register-title" className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
      <h2 id="register-title" className="text-2xl font-bold text-brand-900">
        Register to open the free preview
      </h2>
      <p className="mt-2 text-muted">
        The first module of every Academy course is free for registered users. Register once on this device; the full course, quizzes, final exam and
        certificate come with a subscription.
      </p>
      <form onSubmit={onSubmit} onFocus={startRobotCheck} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Contact />
        <Consent />
        <HoneypotField />
        {state === "error" && (
          <p role="alert" className="text-sm text-red-700 sm:col-span-2">
            Sorry, that didn&apos;t go through. Please check your details and try again.
          </p>
        )}
        <div className="sm:col-span-2">
          <button type="submit" disabled={state === "sending"} className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {state === "sending" ? "Registering..." : "Register and start"}
          </button>
        </div>
      </form>
    </section>
  );
}

export function SubscribePanel({ course }: { course: string }) {
  const [requested, setRequested] = useState(false);
  const { state, onSubmit } = useSubmit("academy", () => {
    remember(MEMBER);
    setRequested(true);
  });
  return (
    <section aria-labelledby="subscribe-title" className="mt-8 rounded-2xl bg-brand-900 p-6 text-white sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold-400">Subscribers</p>
      <h2 id="subscribe-title" className="mt-1 text-2xl font-bold">
        This part of the course is for Academy subscribers
      </h2>
      <p className="mt-2 max-w-3xl text-brand-100">
        Subscribers open every module, the quizzes, the final exam and the certificate of completion, across all Academy courses. Banks and MFIs can
        subscribe for their staff.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_3fr]">
        <CodeForm />
        <div className="rounded-xl bg-white p-5 text-ink sm:p-6">
          <h3 className="text-lg font-bold">Request a subscription</h3>
          {requested ? (
            <p role="status" className="mt-3 text-brand-800">
              Thank you. The Center of Excellence team will contact you with the subscription options and, once it is active, your access code.
            </p>
          ) : (
            <form onSubmit={onSubmit} onFocus={startRobotCheck} className="mt-4 grid gap-4 sm:grid-cols-2">
              <Contact />
              <label className={labelClass}>
                Subscription for
                <select name="plan" required defaultValue="" className={inputClass}>
                  <option value="" disabled>
                    Select one
                  </option>
                  <option>Myself</option>
                  <option>Staff of my institution</option>
                </select>
              </label>
              <label className={labelClass}>
                Number of learners
                <input name="learners" type="number" min={1} max={5000} defaultValue={1} className={inputClass} />
              </label>
              <input type="hidden" name="course" value={course} />
              <Consent />
              <HoneypotField />
              {state === "error" && (
                <p role="alert" className="text-sm text-red-700 sm:col-span-2">
                  Sorry, that didn&apos;t go through. Please check your details and try again.
                </p>
              )}
              <div className="sm:col-span-2">
                <button type="submit" disabled={state === "sending"} className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                  {state === "sending" ? "Sending..." : "Request subscription"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function CodeForm() {
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "wrong" | "seat-preview">("idle");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("checking");
    const clean = code.trim().toUpperCase().replace(/\s+/g, "");
    let ok = accessCodeHashes.has(await sha256(clean));
    if (ok) forgetSeat();
    if (!ok && isSeatCode(clean)) {
      if (!liveHost()) {
        setState("seat-preview");
        return;
      }
      ok = await claimSeat(clean).then(
        () => true,
        () => false,
      );
    }
    if (ok) {
      try {
        window.localStorage.setItem(CODE, clean);
      } catch {
        // Storage unavailable: the code is asked for again with the certificate.
      }
      remember(MEMBER);
      remember(SUBSCRIBER);
    } else setState("wrong");
  }
  return (
    <form onSubmit={onSubmit} className="rounded-xl bg-white/10 p-5 sm:p-6">
      <h3 className="text-lg font-bold">Already subscribed?</h3>
      <label className="mt-3 block text-sm font-semibold">
        Enter your access code
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setState("idle");
          }}
          required
          autoComplete="off"
          spellCheck={false}
          placeholder="INV-XXXXX-XXXXX"
          className="mt-1 w-full rounded-lg border border-white/30 bg-white px-3 py-2.5 font-mono tracking-wider text-ink uppercase focus:outline-none focus:ring-2 focus:ring-gold-400"
        />
      </label>
      {state === "seat-preview" && (
        <p role="alert" className="mt-2 text-sm text-gold-400">
          Staff seat codes from your training department work on eruditeafrica.et, not on this preview site.
        </p>
      )}
      {state === "wrong" && (
        <p role="alert" className="mt-2 text-sm text-gold-400">
          That code is not valid. Check it and try again, or contact {academy.email}.
        </p>
      )}
      <button type="submit" disabled={state === "checking"} className="mt-4 rounded-lg bg-gold-400 px-5 py-2.5 font-semibold text-ink hover:bg-gold-500 disabled:opacity-60">
        Unlock the Academy
      </button>
      <p className="mt-3 text-sm text-brand-100">
        The code is sent by email when your subscription is active; staff of a subscribing bank get theirs from their training department. Enter it once on
        each device you use.
      </p>
    </form>
  );
}

/** A small badge on course pages showing what this visitor can open. */
export function AccessBadge() {
  const access = useAccess();
  if (access === "loading") return null;
  const label = access === "subscriber" ? "Subscriber: full access" : access === "registered" ? "Registered: free preview" : "Free preview after registration";
  return <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white">{label}</span>;
}
