"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { borrowerTypes, collateralTypes } from "@/data/credit/profile";
import {
  HoneypotField,
  liveHost,
  sendForm,
  startRobotCheck,
} from "@/components/forms";
import { frequencies } from "@/lib/calc/loan";
import {
  analyse,
  birr,
  documents,
  has,
  num,
  pct,
  type Profile,
} from "./ProfileBuilder";
import type { Identity } from "./IdentityCheck";

/**
 * The bank-ready pack: a formal application letter plus the borrower profile and an
 * annex of enclosed documents, laid out for A4 and saved as PDF through the browser's
 * print dialog (which keeps Amharic text and needs no library). It is for registered
 * users. Until member accounts open, registering means a one-time sign-up on this
 * device, sent to the Investopia inbox and user list as the "member" form.
 */

type Analysis = ReturnType<typeof analyse>;
type Docs = ReturnType<typeof documents>;

const KEY = "investopia-member-registered";
const COURSE_KEY = "investopia-financial-literacy-registered";
const EVENT = "investopia-member-registered";
let registeredThisVisit = false;

function isRegistered() {
  if (registeredThisVisit) return true;
  try {
    return (
      window.localStorage.getItem(KEY) === "1" ||
      window.localStorage.getItem(COURSE_KEY) === "1"
    );
  } catch {
    return false;
  }
}

function useRegistered() {
  const [registered, setRegistered] = useState(false);
  useEffect(() => {
    const sync = () => setRegistered(isRegistered());
    const t = setTimeout(sync, 0);
    window.addEventListener(EVENT, sync);
    return () => {
      clearTimeout(t);
      window.removeEventListener(EVENT, sync);
    };
  }, []);
  return registered;
}

function markRegistered() {
  registeredThisVisit = true;
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // Storage unavailable: registered for this visit only.
  }
  window.dispatchEvent(new Event(EVENT));
}

const longDate = (d = new Date()) =>
  d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const freqLabel = (p: Profile) =>
  frequencies.find((f) => f.value === p.frequency)!.label.toLowerCase();
const borrowerLabel = (p: Profile) =>
  borrowerTypes
    .find((b) => b.value === p.borrowerType)!
    .label.replace(/ \(.*\)/, "")
    .toLowerCase();

export function defaultLetter(p: Profile, a: Analysis) {
  const name = p.name || "[Applicant name]";
  const amount = has(a.amount) ? birr(a.amount) : "ETB [amount]";
  const isBusiness = p.borrowerType !== "individual";
  const intro = isBusiness
    ? `${name}, a ${borrowerLabel(p)} engaged in ${p.sector.toLowerCase()}${p.started ? ` since ${p.started}` : ""}${p.tin ? `, TIN ${p.tin}` : ""}, hereby applies for a ${a.loan.name.toLowerCase()} of ${amount}.`
    : `I, ${name}${p.tin ? `, TIN ${p.tin}` : ""}, hereby apply for a ${a.loan.name.toLowerCase()} of ${amount}.`;
  const purpose = p.purpose
    ? ` The loan will finance ${p.purpose.replace(/\.$/, "")}.`
    : "";
  const term = p.termMonths
    ? ` We request a term of ${p.termMonths} months${p.graceMonths ? `, including a grace period of ${p.graceMonths} months` : ""}, repaid in ${freqLabel(p)} installments.`
    : "";
  const own =
    has(a.ownShare) && a.ownShare > 0
      ? ` We will contribute ${pct(a.ownShare)} of the total cost of ${birr(num(p.totalCost))} from our own resources.`
      : "";
  const source = p.repaymentSource
    ? ` Repayment will come from ${p.repaymentSource.replace(/\.$/, "")}.`
    : "";
  const coll = p.collateral.length
    ? ` As security we offer ${p.collateral
        .map((c) => {
          const t = collateralTypes
            .find((x) => x.id === c.type)!
            .name.toLowerCase();
          return c.description ? `${t} (${c.description})` : t;
        })
        .join("; ")}.`
    : "";
  const body = `${intro}${purpose}${term}${own}${source}${coll}

Enclosed please find our borrower profile, including our financial summary, banking record and collateral details, together with the supporting documents listed in the annex. We confirm that the information provided is true and complete, and we consent to the bank obtaining our credit information from the National Bank of Ethiopia's credit reference system.

We look forward to your favorable consideration and are ready to provide any further information you may require.`;
  return isBusiness
    ? body
    : body
        .replace(/\bWe\b/g, "I")
        .replace(/\bwe\b/g, "I")
        .replace(/\bour\b/g, "my")
        .replace(/\bOur\b/g, "My")
        .replace(/\bus\b/g, "me");
}

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";
const labelClass = "block text-sm font-medium text-ink";

export function LetterStep({
  p,
  a,
  set,
}: {
  p: Profile;
  a: Analysis;
  set: (patch: Partial<Profile>) => void;
}) {
  const field = (
    label: string,
    key: "letterBank" | "letterBranch" | "signatory" | "signatoryTitle",
    hint?: string,
  ) => (
    <label className={labelClass}>
      {label}
      <input
        value={p[key]}
        onChange={(e) => set({ [key]: e.target.value })}
        className={inputClass}
      />
      {hint && (
        <span className="mt-1 block text-xs font-normal text-muted">
          {hint}
        </span>
      )}
    </label>
  );
  const auto = defaultLetter(p, a);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {field("Bank or MFI", "letterBank", "The lender you are applying to")}
        {field("Branch or department", "letterBranch")}
        {field(
          "Signed by",
          "signatory",
          p.borrowerType === "individual"
            ? "Your full name"
            : "The person authorized to borrow",
        )}
        {field("Title", "signatoryTitle", "For example: General Manager")}
      </div>
      <label className={labelClass}>
        Letter text
        <textarea
          rows={14}
          value={p.letterBody || auto}
          onChange={(e) => set({ letterBody: e.target.value })}
          className={`${inputClass} font-serif leading-relaxed`}
        />
      </label>
      {p.letterBody && p.letterBody !== auto && (
        <button
          type="button"
          onClick={() => set({ letterBody: "" })}
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          Redraft from my answers
        </button>
      )}
    </div>
  );
}

export function PackDownload({ p, verified, onVerify }: { p: Profile; verified: boolean; onVerify: () => void }) {
  const registered = useRegistered();
  const [open, setOpen] = useState(false);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLive(liveHost()), 0);
    return () => clearTimeout(t);
  }, []);
  return (
    <section className="rounded-2xl bg-brand-900 p-6 text-white sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold-400">
        Registered users
      </p>
      <h2 className="mt-1 text-2xl font-bold">Your bank-ready pack</h2>
      <p className="mt-2 max-w-3xl text-brand-100">
        A formal application letter, your complete borrower profile and an annex
        of enclosed documents, laid out on A4 and ready to hand to the bank.
      </p>
      {registered && !verified && live ? (
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button type="button" onClick={onVerify} className="rounded-lg bg-gold-400 px-5 py-3 font-semibold text-ink hover:bg-gold-500">
            Verify the business first
          </button>
          <p className="text-sm text-brand-100">
            The pack opens once Investopia has confirmed the business on the Ministry of Trade register and that you may act for it
            {p.tin ? ` (TIN ${p.tin})` : ""}.
          </p>
        </div>
      ) : registered ? (
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-gold-400 px-5 py-3 font-semibold text-ink hover:bg-gold-500"
          >
            Download PDF
          </button>
          <p className="text-sm text-brand-100">
            In the print window, choose &ldquo;Save as PDF&rdquo; as the
            destination.
            {!verified && " Preview site: the pack is marked as not identity-verified."}
          </p>
        </div>
      ) : open ? (
        <div className="mt-6 rounded-xl bg-white p-5 text-ink sm:p-6">
          <RegisterForm
            defaults={{
              name: p.signatory || p.managers.find((m) => m.name)?.name || "",
              business: p.borrowerType === "individual" ? "" : p.name,
              email: p.email,
              phone: p.phone,
            }}
          />
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-gold-400 px-5 py-3 font-semibold text-ink hover:bg-gold-500"
          >
            Register free to download
          </button>
          <Link
            href="/login"
            className="text-sm font-semibold text-white underline-offset-4 hover:underline"
          >
            Already registered? Log in
          </Link>
        </div>
      )}
    </section>
  );
}

function RegisterForm({
  defaults,
}: {
  defaults: { name: string; business: string; email: string; phone: string };
}) {
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.set("page", window.location.pathname);
    if (liveHost()) {
      setState("sending");
      try {
        await sendForm("member", data);
      } catch {
        setState("error");
        return;
      }
    }
    markRegistered();
  }
  const input = (
    name: string,
    label: string,
    type: string,
    value: string,
    extra: Record<string, string> = {},
  ) => (
    <label className={labelClass}>
      {label}
      <input
        name={name}
        type={type}
        required
        defaultValue={value}
        className={inputClass}
        {...extra}
      />
    </label>
  );
  return (
    <form
      onSubmit={onSubmit}
      onFocus={startRobotCheck}
      className="grid gap-4 sm:grid-cols-2"
    >
      <p className="text-sm text-muted sm:col-span-2">
        Create your free Investopia registration to download bank-ready packs.
        It takes a moment, and you only do it once on this device.
      </p>
      {input("name", "Full name", "text", defaults.name, {
        autoComplete: "name",
        maxLength: "120",
      })}
      <label className={labelClass}>
        Business name (if any)
        <input
          name="business"
          type="text"
          defaultValue={defaults.business}
          maxLength={160}
          className={inputClass}
        />
      </label>
      {input("email", "Email address", "email", defaults.email, {
        autoComplete: "email",
        maxLength: "160",
      })}
      {input("mobile", "Mobile number", "tel", defaults.phone, {
        autoComplete: "tel",
        inputMode: "tel",
        pattern: "^\\+?[0-9 ]{9,16}$",
      })}
      <label className="flex gap-3 text-sm text-ink sm:col-span-2">
        <input
          name="consent"
          type="checkbox"
          value="yes"
          required
          className="mt-1 h-4 w-4 shrink-0 accent-brand-600"
        />
        <span>
          I agree to Investopia&apos;s{" "}
          <Link href="/legal/terms" className="text-brand-700 underline">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="text-brand-700 underline">
            privacy policy
          </Link>
          , and to be contacted about my registration. My borrower profile
          itself stays on my device.
        </span>
      </label>
      <HoneypotField />
      {state === "error" && (
        <p role="alert" className="text-sm text-red-700 sm:col-span-2">
          Sorry, that didn&apos;t go through. Please check your details and try
          again.
        </p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {state === "sending" ? "Registering..." : "Register and continue"}
        </button>
      </div>
    </form>
  );
}

/* ---------- the printed pack ---------- */

function Row({ label, children }: { label: string; children: ReactNode }) {
  if (!children) return null;
  return (
    <tr>
      <th className="w-[38%] border border-slate-300 bg-slate-50 px-2 py-1 text-left align-top font-semibold">
        {label}
      </th>
      <td className="border border-slate-300 px-2 py-1 align-top">
        {children}
      </td>
    </tr>
  );
}

function H({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-5 mb-2 border-b-2 border-slate-800 pb-1 text-[12pt] font-bold uppercase tracking-wide">
      {children}
    </h2>
  );
}

const cell = "border border-slate-300 px-2 py-1";

export function BankPack({
  p,
  a,
  docs,
  identity,
}: {
  p: Profile;
  a: Analysis;
  docs: Docs;
  identity?: Identity;
}) {
  const registered = useRegistered();
  if (registered && !identity && liveHost())
    return (
      <div className="hidden print:block">
        <p className="text-lg font-bold">
          The bank-ready pack opens once the business identity is verified.
        </p>
        <p className="mt-2">
          Complete the identity check on the borrower profile builder page,
          then choose Download PDF.
        </p>
      </div>
    );
  if (!registered)
    return (
      <div className="hidden print:block">
        <p className="text-lg font-bold">
          The bank-ready pack is available to registered Investopia users.
        </p>
        <p className="mt-2">
          Register free on the borrower profile builder page, then choose
          Download PDF.
        </p>
      </div>
    );

  const isBusiness = p.borrowerType !== "individual";
  const letter = p.letterBody || defaultLetter(p, a);
  const years = p.years.filter((y) => y.sales || y.profit || y.cost);
  const attached = docs.flatMap((g) =>
    g.items.map((d) => ({
      group: g.title,
      doc: d,
      files: p.files[d] ?? [],
      ready: !!p.done[d] || (p.files[d] ?? []).length > 0,
    })),
  );

  return (
    <div className="bank-pack hidden bg-white font-serif text-[10.5pt] leading-snug text-black print:block">
      {/* Application letter */}
      <section className="min-h-[250mm]">
        <div className="flex items-start justify-between border-b border-slate-400 pb-3">
          <div>
            <p className="text-[14pt] font-bold">{p.name || "Applicant"}</p>
            <p>{p.address}</p>
            <p>{[p.phone, p.email].filter(Boolean).join(" · ")}</p>
            {p.tin && <p>TIN: {p.tin}</p>}
          </div>
          <p className="text-right">{longDate()}</p>
        </div>
        <div className="mt-6">
          <p>To:</p>
          <p className="font-semibold">{p.letterBank || "[Bank or MFI]"}</p>
          {p.letterBranch && <p>{p.letterBranch}</p>}
        </div>
        <p className="mt-6 font-bold underline">
          Subject: Application for a {a.loan.name.toLowerCase()} of{" "}
          {has(a.amount) ? birr(a.amount) : "ETB [amount]"}
        </p>
        <p className="mt-4">Dear Sir or Madam,</p>
        {letter.split(/\n\s*\n/).map((para, i) => (
          <p key={i} className="mt-3 text-justify">
            {para}
          </p>
        ))}
        <p className="mt-6">Yours sincerely,</p>
        <div className="mt-14 grid grid-cols-2 gap-8">
          <div>
            <p className="border-t border-black pt-1 font-semibold">
              {p.signatory || "[Name]"}
            </p>
            <p>{p.signatoryTitle}</p>
          </div>
          <div>
            <p className="border-t border-black pt-1">Signature and stamp</p>
          </div>
        </div>
        <p className="mt-8 text-[9.5pt]">
          Enclosures: borrower profile; supporting documents as listed in the
          annex.
        </p>
      </section>

      {/* Borrower profile */}
      <section className="break-before-page">
        <div className="border-b-4 border-slate-800 pb-2">
          <p className="text-[9pt] uppercase tracking-widest">
            Borrower profile
          </p>
          <p className="text-[16pt] font-bold">{p.name || "Applicant"}</p>
          <p className="text-[9pt]">
            Prepared {longDate()} · Figures as stated by the applicant
          </p>
          <p className="text-[9pt] font-bold">
            {identity
              ? `Identity verified by Investopia${identity.verifiedOn ? ` on ${identity.verifiedOn}` : ""}: TIN ${identity.tin}${identity.licence ? `, licence ${identity.licence}` : ""}, checked against the Ministry of Trade register; requested by ${identity.requester} (${identity.role.split(" (")[0].toLowerCase()}).`
              : "Preview copy: business identity not verified."}
          </p>
        </div>

        <H>Applicant</H>
        <table className="w-full border-collapse">
          <tbody>
            <Row label="Borrower type">
              {borrowerTypes.find((b) => b.value === p.borrowerType)!.label}
            </Row>
            <Row label="Tax Identification Number">{p.tin}</Row>
            <Row label="Sector">{p.sector}</Row>
            {isBusiness && (
              <Row label="Trade licence">
                {[p.licence, p.licenceRenewed && `renewed ${p.licenceRenewed}`]
                  .filter(Boolean)
                  .join(", ")}
              </Row>
            )}
            {isBusiness && <Row label="In operation since">{p.started}</Row>}
            <Row label="Address">{p.address}</Row>
            <Row label="Telephone / email">
              {[p.phone, p.email].filter(Boolean).join(" · ")}
            </Row>
            <Row label="Marital status">{p.maritalStatus}</Row>
          </tbody>
        </table>

        {isBusiness && p.owners.some((o) => o.name) && (
          <>
            <H>Ownership</H>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className={`${cell} text-left`}>Owner / shareholder</th>
                  <th className={`${cell} text-right`}>Share</th>
                  <th className={`${cell} text-left`}>Role</th>
                </tr>
              </thead>
              <tbody>
                {p.owners
                  .filter((o) => o.name)
                  .map((o, i) => (
                    <tr key={i}>
                      <td className={cell}>{o.name}</td>
                      <td className={`${cell} text-right`}>
                        {o.share && `${o.share}%`}
                      </td>
                      <td className={cell}>{o.role}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}

        {p.managers.some((m) => m.name) && (
          <>
            <H>{isBusiness ? "Management" : "Applicant background"}</H>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className={`${cell} text-left`}>Name</th>
                  <th className={`${cell} text-left`}>
                    {isBusiness ? "Position" : "Occupation"}
                  </th>
                  <th className={`${cell} text-left`}>Education</th>
                  <th className={`${cell} text-right`}>Experience</th>
                </tr>
              </thead>
              <tbody>
                {p.managers
                  .filter((m) => m.name)
                  .map((m, i) => (
                    <tr key={i}>
                      <td className={cell}>{m.name}</td>
                      <td className={cell}>{m.position}</td>
                      <td className={cell}>{m.education}</td>
                      <td className={`${cell} text-right`}>
                        {m.years && `${m.years} years`}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}

        {p.related.some((r) => r.name) && (
          <>
            <H>Related parties</H>
            <table className="w-full border-collapse">
              <tbody>
                {p.related
                  .filter((r) => r.name)
                  .map((r, i) => (
                    <Row
                      key={i}
                      label={`${r.name}${r.relation ? ` (${r.relation})` : ""}`}
                    >
                      {r.loans || "No loans stated"}
                    </Row>
                  ))}
              </tbody>
            </table>
          </>
        )}

        <H>Loan request</H>
        <table className="w-full border-collapse">
          <tbody>
            <Row label="Facility">
              {a.loan.name}
              {p.loanType === "project" &&
                ` (${p.projectStage === "expansion" ? "expansion" : "new project"})`}
            </Row>
            <Row label="Amount">{has(a.amount) ? birr(a.amount) : ""}</Row>
            <Row label="Purpose">{p.purpose}</Row>
            <Row label="Term">
              {p.termMonths &&
                `${p.termMonths} months${p.graceMonths ? `, including ${p.graceMonths} months' grace` : ""}`}
            </Row>
            <Row label="Repayment">
              {frequencies.find((f) => f.value === p.frequency)!.label}
            </Row>
            <Row label="Estimated installment">
              {has(a.installment)
                ? `${birr(a.installment)} (at ${p.rate}% a year, indicative)`
                : ""}
            </Row>
            <Row label="Total cost and own contribution">
              {has(a.ownShare)
                ? `${birr(num(p.totalCost))}; own contribution ${pct(a.ownShare)}`
                : ""}
            </Row>
            <Row label="Source of repayment">{p.repaymentSource}</Row>
            <Row label="Total borrowing after this facility">
              {a.exposure ? birr(a.exposure) : ""}
            </Row>
          </tbody>
        </table>

        {(years.length > 0 || a.ratios.length > 0) && (
          <section className="break-inside-avoid">
            <H>
              Financial summary
              {isBusiness &&
                ` (${p.statements === "audited" ? "audited" : p.statements === "provisional" ? "provisional" : "no formal books"})`}
            </H>
            {years.length > 0 && (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className={`${cell} text-left`}>ETB</th>
                    {years.map((y) => (
                      <th key={y.year} className={`${cell} text-right`}>
                        {y.year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      [isBusiness ? "Sales" : "Income", "sales"],
                      [isBusiness ? "Cost of sales" : "Living costs", "cost"],
                      ["Net profit", "profit"],
                    ] as const
                  ).map(([label, k]) => (
                    <tr key={k}>
                      <td className={cell}>{label}</td>
                      {years.map((y) => (
                        <td key={y.year} className={`${cell} text-right`}>
                          {has(num(y[k]))
                            ? Math.round(num(y[k])).toLocaleString("en-US")
                            : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <table className="mt-3 w-full border-collapse">
              <tbody>
                <Row label="Current assets">
                  {p.currentAssets && birr(num(p.currentAssets))}
                </Row>
                <Row label="Of which stock">
                  {p.inventory && birr(num(p.inventory))}
                </Row>
                <Row label="Of which receivables">
                  {p.receivables && birr(num(p.receivables))}
                </Row>
                <Row label="Current liabilities">
                  {p.currentLiabilities && birr(num(p.currentLiabilities))}
                </Row>
                <Row label="Total assets">
                  {p.totalAssets && birr(num(p.totalAssets))}
                </Row>
                <Row label="Total liabilities">
                  {p.totalLiabilities && birr(num(p.totalLiabilities))}
                </Row>
                <Row label="Owners' equity">
                  {p.equity && birr(num(p.equity))}
                </Row>
                {a.ratios.map((r) => (
                  <Row key={r.label} label={r.label}>
                    {r.value}
                  </Row>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {isBusiness && (p.customers || p.suppliers) && (
          <>
            <H>Customers and suppliers</H>
            <table className="w-full border-collapse">
              <tbody>
                <Row label="Main customers">{p.customers}</Row>
                <Row label="Main suppliers">{p.suppliers}</Row>
              </tbody>
            </table>
          </>
        )}

        <section className="break-inside-avoid">
          <H>Banking relationship and existing facilities</H>
          <table className="w-full border-collapse">
            <tbody>
              <Row label="Main bank">
                {[p.mainBank, p.bankSince && `customer since ${p.bankSince}`]
                  .filter(Boolean)
                  .join(", ")}
              </Row>
              <Row label="Credit record (declared)">
                {p.creditRecord === "clean"
                  ? "All loans paid on time"
                  : p.creditRecord === "issues"
                    ? "Past problems declared"
                    : "Not stated"}
              </Row>
            </tbody>
          </table>
          {p.facilities.length > 0 && (
            <table className="mt-3 w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className={`${cell} text-left`}>Lender</th>
                  <th className={`${cell} text-left`}>Facility</th>
                  <th className={`${cell} text-right`}>Limit</th>
                  <th className={`${cell} text-right`}>Outstanding</th>
                  <th className={`${cell} text-right`}>Monthly</th>
                  <th className={`${cell} text-left`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {p.facilities.map((f, i) => (
                  <tr key={i}>
                    <td className={cell}>{f.lender}</td>
                    <td className={cell}>{f.type}</td>
                    <td className={`${cell} text-right`}>
                      {has(num(f.limit))
                        ? Math.round(num(f.limit)).toLocaleString("en-US")
                        : ""}
                    </td>
                    <td className={`${cell} text-right`}>
                      {has(num(f.outstanding))
                        ? Math.round(num(f.outstanding)).toLocaleString("en-US")
                        : ""}
                    </td>
                    <td className={`${cell} text-right`}>
                      {has(num(f.installment))
                        ? Math.round(num(f.installment)).toLocaleString("en-US")
                        : ""}
                    </td>
                    <td className={cell}>
                      {f.status === "performing"
                        ? "Paid on time"
                        : f.status === "late"
                          ? "Late payments"
                          : "Non-performing"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {p.collateral.length > 0 && (
          <section className="break-inside-avoid">
            <H>Collateral offered</H>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className={`${cell} text-left`}>Type</th>
                  <th className={`${cell} text-left`}>Description</th>
                  <th className={`${cell} text-left`}>Owner</th>
                  <th className={`${cell} text-right`}>
                    Estimated value (ETB)
                  </th>
                  <th className={`${cell} text-left`}>Insured</th>
                </tr>
              </thead>
              <tbody>
                {p.collateral.map((c, i) => (
                  <tr key={i}>
                    <td className={cell}>
                      {collateralTypes.find((t) => t.id === c.type)!.name}
                    </td>
                    <td className={cell}>
                      {c.description}
                      {c.year && ` (${c.year})`}
                    </td>
                    <td className={cell}>
                      {c.owner === "third" ? "Third party" : "Applicant"}
                    </td>
                    <td className={`${cell} text-right`}>
                      {has(num(c.value))
                        ? Math.round(num(c.value)).toLocaleString("en-US")
                        : ""}
                    </td>
                    <td className={cell}>{c.insured ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-1 text-[9pt]">
              Values are the applicant&apos;s estimates, subject to the
              lender&apos;s own valuation.
            </p>
          </section>
        )}

        <section className="mt-6 break-inside-avoid">
          <H>Declaration</H>
          <p className="text-justify">
            I/We declare that the information in this profile is true and
            complete to the best of my/our knowledge, and authorize the lender
            to verify it and to obtain credit information from the National Bank
            of Ethiopia&apos;s credit reference system.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            <p className="border-t border-black pt-1">Name: {p.signatory}</p>
            <p className="border-t border-black pt-1">Signature and stamp</p>
            <p className="border-t border-black pt-1">Date</p>
          </div>
        </section>
      </section>

      {/* Annex */}
      <section className="break-before-page">
        <H>Annex: enclosed documents</H>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className={`${cell} w-8 text-left`}>#</th>
              <th className={`${cell} text-left`}>Document</th>
              <th className={`${cell} text-left`}>Enclosed</th>
            </tr>
          </thead>
          <tbody>
            {attached.map((d, i) => (
              <tr key={d.doc} className="break-inside-avoid">
                <td className={cell}>{i + 1}</td>
                <td className={cell}>{d.doc}</td>
                <td className={cell}>
                  {d.files.length
                    ? d.files.map((f) => f.name).join(", ")
                    : d.ready
                      ? "Yes"
                      : "To follow"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-[9pt]">
          Prepared with the Investopia Borrower Profile Builder (investopia.et).
          Investopia is not a lender; every credit decision is made by the
          lender under its own policies.
        </p>
      </section>
    </div>
  );
}
