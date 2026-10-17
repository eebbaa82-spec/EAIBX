"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { businessTypes, dimensions, questions, screening, typeWeights, type Answers, type BusinessType, type DimensionId, type Question } from "@/lib/ehira/model";
import { isoDate, isVisible, score, taxClearance } from "@/lib/ehira/score";

const STORAGE_KEY = "kena-ehira-draft-v2";

type Step = { id: string; title: string; intro?: string; ids: string[] };

const allSteps: Step[] = [
  ...dimensions.map((d) => ({
    id: d.id,
    title: d.name,
    intro: d.id === "financial" ? "Use your last full financial year. The figures marked optional let us calculate your financial ratios; leave them blank if you do not have them." : undefined,
    ids: questions.filter((q) => q.dimension === d.id).map((q) => q.id),
  })),
  { id: "screening", title: "Legal and compliance screening", intro: "These answers do not add points, but some of them limit the highest grade a business can receive.", ids: screening.map((s) => s.id) },
];

type Draft = { answers: Answers; type: string; name: string };
const EMPTY: Draft = { answers: {}, type: "", name: "" };

// A saved draft is read once in the browser; the server render always starts empty.
let savedDraft: Draft | undefined;
function readSaved(): Draft {
  if (savedDraft) return savedDraft;
  let draft = EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) draft = { ...EMPTY, ...JSON.parse(raw) };
  } catch {}
  savedDraft = draft;
  return draft;
}
const subscribeNever = () => () => {};

function save(state: Draft) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const inputClass = "mt-2 w-full max-w-xs rounded-lg border border-line bg-white px-3 py-2 text-ink focus:border-brand-500 focus:outline-none";
const choice = (on: boolean) =>
  `cursor-pointer rounded-lg border px-4 py-1.5 text-sm ${on ? "border-brand-600 bg-brand-50 font-semibold text-brand-800" : "border-line text-ink hover:bg-canvas"}`;

function parseNumber(v: string) {
  const clean = v.replace(/,/g, "").trim();
  if (clean === "" || clean === "-") return undefined;
  const n = Number(clean);
  return Number.isFinite(n) ? n : undefined;
}

function QuestionField({ q, value, onChange }: { q: Question | { id: string; text: string; type: "yesno"; required: true; help?: string; evidence?: string }; value: Answers[string]; onChange: (v: Answers[string]) => void }) {
  const [text, setText] = useState(typeof value === "number" ? value.toLocaleString("en-US") : "");
  return (
    <fieldset className="rounded-xl border border-line bg-white p-5">
      <legend className="sr-only">{q.text}</legend>
      <p className="font-semibold text-ink">
        {q.text}
        {!q.required && <span className="font-normal text-muted"> (optional)</span>}
      </p>
      {q.help && <p className="mt-1 text-sm text-muted">{q.help}</p>}
      {q.type === "yesno" && (
        <div className="mt-3 flex gap-2">
          {(["yes", "no"] as const).map((v) => (
            <label key={v} className={choice(value === v)}>
              <input type="radio" name={q.id} className="sr-only" checked={value === v} onChange={() => onChange(v)} />
              {v === "yes" ? "Yes" : "No"}
            </label>
          ))}
        </div>
      )}
      {q.type === "scale" && (
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <label key={v} className={choice(value === v)}>
              <input type="radio" name={q.id} className="sr-only" checked={value === v} onChange={() => onChange(v)} />
              {v}
            </label>
          ))}
        </div>
      )}
      {q.type === "choice" && "options" in q && (
        <div className="mt-3 flex flex-wrap gap-2">
          {q.options?.map((o) => (
            <label key={o.value} className={choice(value === o.value)}>
              <input type="radio" name={q.id} className="sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
              {o.label}
            </label>
          ))}
        </div>
      )}
      {(q.type === "percent" || q.type === "number" || q.type === "money" || q.type === "months") && (
        <div className="flex items-center gap-2">
          <input
            aria-label={q.text}
            inputMode="decimal"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              const n = parseNumber(e.target.value);
              onChange(q.type === "percent" && n !== undefined ? Math.min(100, Math.max(0, n)) : n);
            }}
            className={inputClass}
          />
          <span className="mt-2 text-sm text-muted">{q.type === "percent" ? "%" : q.type === "money" ? "ETB" : q.type === "months" ? "months" : ""}</span>
        </div>
      )}
      {q.evidence && (
        <p className="mt-3 text-xs text-muted">
          Evidence: {q.evidence}. You will upload it with the verified assessment once member accounts open.
        </p>
      )}
    </fieldset>
  );
}

const FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const FILE_MAX_BYTES = 5 * 1024 * 1024;

/** The certificate details are complete and the file is attached in this browser session. */
function taxComplete(a: Answers, file: File | null) {
  const s = (k: string) => (typeof a[k] === "string" ? (a[k] as string).trim() : "");
  return /^\d{10}$/.test(s("G3_TIN")) && s("G3_NO") !== "" && s("G3_ISSUE") !== "" && s("G3_EXPIRY") !== "" && s("G3_EXPIRY") >= s("G3_ISSUE") && file !== null;
}

type FieldProps = { q: Question; answers: Answers; file: File | null; onAnswer: (id: string, v: string | undefined) => void; onFile: (f: File | null) => void };

/** A PDF, JPG or PNG kept in memory only; the draft remembers just its name (answer `<id>_FILE`). */
function FileField({ label, id, answers, file, onFile }: { label: string; id: string; answers: Answers; file: File | null; onFile: (f: File | null) => void }) {
  const [error, setError] = useState("");
  const earlier = answers[`${id}_FILE`];
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-ink">
        {label} <span className="font-normal text-muted">(PDF, JPG or PNG, up to 5 MB)</span>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            if (f && !FILE_TYPES.includes(f.type)) return setError("Please attach a PDF, JPG or PNG file.");
            if (f && f.size > FILE_MAX_BYTES) return setError("The file is larger than 5 MB.");
            setError("");
            onFile(f);
          }}
          className="mt-2 block w-full text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand-700"
        />
      </label>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      {file && <p className="mt-2 text-sm text-ink">Attached: {file.name} ({Math.ceil(file.size / 1024).toLocaleString("en-US")} KB)</p>}
      {!file && typeof earlier === "string" && earlier && <p className="mt-2 text-sm text-muted">You attached {earlier} earlier. Files are not kept after you leave the page, so please attach it again.</p>}
    </div>
  );
}

export const REPORT_MAX_AGE_DAYS = 90;
const daysAgo = (iso: string) => (Date.now() - new Date(`${iso}T00:00:00`).getTime()) / 86_400_000;

/** F8: either the signed declaration, or the business's own NBE credit report attached with its result. */
function creditComplete(a: Answers, file: File | null) {
  const s = (k: string) => (typeof a[k] === "string" ? (a[k] as string).trim() : "");
  if (s("F8_ROUTE") === "declaration") return s("F8_AGREE") === "yes" && s("F8_SIGNER") !== "" && s("F8_POSITION") !== "";
  if (s("F8_ROUTE") === "report") {
    const age = s("F8_REPORT_DATE") ? daysAgo(s("F8_REPORT_DATE")) : NaN;
    return file !== null && age >= -1 && age <= REPORT_MAX_AGE_DAYS && (a.F8 === "yes" || a.F8 === "no");
  }
  return false;
}

export const declarationText = (business: string) =>
  `${business || "The business"} declares that it has no non-performing loan (a loan more than 90 days overdue) with any bank or microfinance institution in Ethiopia, and undertakes to take full responsibility should a lender obtain information stating otherwise.`;

function CreditInfoField({ q, answers, file, onAnswer, onFile, business }: FieldProps & { business: string }) {
  const val = (k: string) => (typeof answers[k] === "string" ? (answers[k] as string) : "");
  const route = val("F8_ROUTE");
  const reportDate = val("F8_REPORT_DATE");
  const age = reportDate ? daysAgo(reportDate) : null;
  return (
    <fieldset className="rounded-xl border border-line bg-white p-5">
      <legend className="sr-only">{q.text}</legend>
      <p className="font-semibold text-ink">{q.text}</p>
      {q.help && <p className="mt-1 text-sm text-muted">{q.help}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { v: "declaration", label: "Sign the declaration" },
          { v: "report", label: "Attach my NBE credit report" },
        ].map((o) => (
          <label key={o.v} className={choice(route === o.v)}>
            <input type="radio" name="F8_ROUTE" className="sr-only" checked={route === o.v} onChange={() => onAnswer("F8_ROUTE", o.v)} />
            {o.label}
          </label>
        ))}
      </div>

      {route === "declaration" && (
        <div className="mt-5 space-y-4">
          <blockquote className="rounded-lg border-l-4 border-brand-600 bg-canvas p-4 text-ink">{declarationText(business)}</blockquote>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              Full name of the person signing
              <input value={val("F8_SIGNER")} onChange={(e) => onAnswer("F8_SIGNER", e.target.value)} className={`${inputClass} max-w-none`} />
            </label>
            <label className="block text-sm font-medium text-ink">
              Position (owner, general manager or authorized officer)
              <input value={val("F8_POSITION")} onChange={(e) => onAnswer("F8_POSITION", e.target.value)} className={`${inputClass} max-w-none`} />
            </label>
          </div>
          <label className="flex items-start gap-3 text-sm text-ink">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={val("F8_AGREE") === "yes"}
              onChange={(e) => {
                onAnswer("F8_AGREE", e.target.checked ? "yes" : undefined);
                onAnswer("F8_DATE", e.target.checked ? isoDate(new Date()) : undefined);
              }}
            />
            <span>I am authorized to sign for the business, and I confirm this declaration is true.</span>
          </label>
          <p className="text-sm text-muted">If the business has a loan more than 90 days overdue, do not sign. Attach your NBE credit report instead.</p>
        </div>
      )}

      {route === "report" && (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-ink">
            Request your commercial credit report from the National Bank of Ethiopia&apos;s credit reference system, through NBE or your bank. Attach it
            here; Kena analysts review it as part of due diligence.
          </p>
          <label className="block text-sm font-medium text-ink">
            Date of the report
            <input type="date" value={reportDate} onChange={(e) => onAnswer("F8_REPORT_DATE", e.target.value)} className={`${inputClass} max-w-none`} />
            {age !== null && (age > REPORT_MAX_AGE_DAYS || age < -1) && (
              <span className="mt-1 block text-xs font-normal text-red-700">The report must be dated within the last {REPORT_MAX_AGE_DAYS} days.</span>
            )}
          </label>
          <FileField label="Credit report" id="F8" answers={answers} file={file} onFile={onFile} />
          <div>
            <p className="text-sm font-medium text-ink">Does the report show any loan more than 90 days overdue?</p>
            <div className="mt-2 flex gap-2">
              {(["no", "yes"] as const).map((v) => (
                <label key={v} className={choice(answers.F8 === v)}>
                  <input type="radio" name="F8" className="sr-only" checked={answers.F8 === v} onChange={() => onAnswer("F8", v)} />
                  {v === "yes" ? "Yes" : "No"}
                </label>
              ))}
            </div>
            {answers.F8 === "yes" && <p className="mt-3 rounded-lg bg-gold-100 p-3 text-sm text-ink">You can continue, but a non-performing loan caps your grade at D.</p>}
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-muted">Nothing here is sent to Kena until the verified EHIRA, where an analyst reviews it.</p>
    </fieldset>
  );
}

function TaxClearanceField({ q, answers, file, onAnswer, onFile }: FieldProps) {
  const val = (k: string) => (typeof answers[k] === "string" ? (answers[k] as string) : "");
  const status = taxClearance(answers);
  const tin = val("G3_TIN");
  const dates = val("G3_ISSUE") && val("G3_EXPIRY") && val("G3_EXPIRY") < val("G3_ISSUE");
  return (
    <fieldset className="rounded-xl border border-line bg-white p-5">
      <legend className="sr-only">{q.text}</legend>
      <p className="font-semibold text-ink">{q.text}</p>
      {q.help && <p className="mt-1 text-sm text-muted">{q.help}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">
          Taxpayer Identification Number (TIN)
          <input inputMode="numeric" maxLength={10} value={tin} onChange={(e) => onAnswer("G3_TIN", e.target.value.replace(/\D/g, ""))} className={`${inputClass} max-w-none`} />
          {tin && tin.length !== 10 && <span className="mt-1 block text-xs font-normal text-red-700">A TIN has 10 digits.</span>}
        </label>
        <label className="block text-sm font-medium text-ink">
          Certificate number
          <input value={val("G3_NO")} onChange={(e) => onAnswer("G3_NO", e.target.value)} className={`${inputClass} max-w-none`} />
        </label>
        <label className="block text-sm font-medium text-ink">
          Date issued
          <input type="date" value={val("G3_ISSUE")} onChange={(e) => onAnswer("G3_ISSUE", e.target.value)} className={`${inputClass} max-w-none`} />
        </label>
        <label className="block text-sm font-medium text-ink">
          Valid until
          <input type="date" value={val("G3_EXPIRY")} onChange={(e) => onAnswer("G3_EXPIRY", e.target.value)} className={`${inputClass} max-w-none`} />
          {dates && <span className="mt-1 block text-xs font-normal text-red-700">The expiry date is before the issue date.</span>}
        </label>
      </div>
      <FileField label="Certificate file" id="G3" answers={answers} file={file} onFile={onFile} />
      {status === "expired" && (
        <p className="mt-4 rounded-lg bg-gold-100 p-3 text-sm text-ink">This certificate has expired. You can continue, but an expired certificate caps your grade at C.</p>
      )}
      <p className="mt-4 text-xs text-muted">
        The file stays in this browser and is not sent to Kena. In the verified EHIRA, an analyst checks the certificate with the issuing tax authority.
      </p>
    </fieldset>
  );
}

export function EhiraAssessment() {
  const saved = useSyncExternalStore(subscribeNever, readSaved, () => EMPTY);
  const [own, setState] = useState<Draft | null>(null);
  const state = own ?? saved;
  const [pos, setPos] = useState(-1);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const { answers, type, name } = state;

  const update = (patch: Partial<Draft>) => {
    const next = { ...state, ...patch };
    setState(next);
    save(next);
  };
  const setAnswer = (id: string, v: Answers[string]) => update({ answers: { ...answers, [id]: v } });
  // Several fields can change in one event (the declaration's tick and its date), so each builds on the latest draft.
  const setField = (id: string, v: Answers[string]) =>
    setState((prev) => {
      const base = prev ?? saved;
      const next = { ...base, answers: { ...base.answers, [id]: v } };
      save(next);
      return next;
    });
  const setFile = (id: string, f: File | null) => {
    setFiles((x) => ({ ...x, [id]: f }));
    setField(`${id}_FILE`, f?.name);
  };

  const bt = (businessTypes.some((b) => b.id === type) ? type : "sme") as BusinessType;
  const result = useMemo(() => score(answers, bt), [answers, bt]);

  // One question per screen. Dimensions with no weight for this business type are skipped.
  const steps = allSteps.filter((s) => s.id === "screening" || typeWeights[bt][s.id as DimensionId] > 0);
  const items = steps.flatMap((s, si) =>
    s.ids
      .filter((id) => {
        const q = questions.find((x) => x.id === id);
        return !q || isVisible(q, answers, bt);
      })
      .map((id, qi) => ({ id, step: s, stepIndex: si, first: qi === 0 })),
  );
  const item = items[pos];
  const q: Question | undefined = item
    ? questions.find((x) => x.id === item.id) ?? { ...screening.find((s) => s.id === item.id)!, dimension: "governance", type: "yesno", required: true, weight: 0, action: "" }
    : undefined;
  const answered = q
    ? q.type === "taxclearance"
      ? taxComplete(answers, files.G3 ?? null)
      : q.type === "creditinfo"
        ? creditComplete(answers, files.F8 ?? null)
        : !q.required || answers[q.id] !== undefined
    : false;

  const go = (to: number) => {
    setPos(to);
    window.scrollTo({ top: document.getElementById("assessment")?.offsetTop ?? 0, behavior: "smooth" });
  };
  const choose = (v: Answers[string]) => {
    const firstTime = answers[item.id] === undefined;
    setAnswer(item.id, v);
    // Move on by itself the first time a choice is picked; changing an answer stays put.
    if (firstTime) window.setTimeout(() => go(pos + 1), 250);
  };

  if (pos === -1)
    return (
      <div className="max-w-2xl space-y-5 rounded-xl border border-line bg-white p-6">
        <div>
          <label htmlFor="ehira-name" className="block text-sm font-medium text-ink">
            Business name <span className="font-normal text-muted">(optional, shown on your report)</span>
          </label>
          <input id="ehira-name" value={name} onChange={(e) => update({ name: e.target.value })} className={`${inputClass} max-w-none`} />
        </div>
        <fieldset>
          <legend className="text-sm font-medium text-ink">Which best describes the business?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {businessTypes.map((t) => (
              <label key={t.id} className={choice(type === t.id)}>
                <input type="radio" name="type" className="sr-only" checked={type === t.id} onChange={() => update({ type: t.id })} />
                {t.label}
              </label>
            ))}
          </div>
          {type && <p className="mt-2 text-sm text-muted">Focus for this version: {businessTypes.find((t) => t.id === type)?.focus}</p>}
        </fieldset>
        <p className="rounded-lg bg-canvas p-3 text-sm text-ink">
          Have your tax clearance certificate ready (PDF or photo), with your TIN, the certificate number and its dates. You will also either sign a declaration that the business has no non-performing loan or attach your own NBE credit report. Both are mandatory.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={!type} onClick={() => go(0)} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
            {Object.keys(answers).length ? "Continue the assessment" : "Start the assessment"}
          </button>
          {(Object.keys(answers).length > 0 || name !== "" || type !== "") && (
            <button type="button" onClick={() => { update(EMPTY); setFiles({}); }} className="text-sm font-semibold text-brand-700 hover:underline">
              Clear my answers and start over
            </button>
          )}
        </div>
        <p className="text-xs text-muted">One question at a time, about 15 minutes. Your report appears at the end. Your answers stay in this browser only and are not sent to Kena.</p>
      </div>
    );

  if (pos >= items.length)
    return (
      <Report
        result={result}
        name={name}
        type={businessTypes.find((t) => t.id === bt)!.label}
        answers={answers}
        files={files}
        onEdit={() => go(0)}
        onRestart={() => { update(EMPTY); setFiles({}); go(-1); }}
      />
    );

  const last = pos === items.length - 1;
  return (
    <form
      className="max-w-3xl"
      onSubmit={(e) => {
        e.preventDefault();
        if (answered) go(pos + 1);
      }}
    >
      <div className="mb-6">
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          <p className="font-semibold text-brand-700">
            {item.step.title} <span className="font-normal text-muted">· section {item.stepIndex + 1} of {steps.length}</span>
          </p>
          <p className="text-muted">
            Question {pos + 1} of {items.length}
          </p>
        </div>
        <div className="mt-2 h-2 rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={pos + 1} aria-label="Progress">
          <div className="h-2 rounded-full bg-brand-600 transition-all" style={{ width: `${((pos + 1) / items.length) * 100}%` }} />
        </div>
        {item.first && item.step.intro && <p className="mt-4 text-muted">{item.step.intro}</p>}
      </div>
      {q!.type === "taxclearance" ? (
        <TaxClearanceField q={q!} answers={answers} file={files.G3 ?? null} onAnswer={setField} onFile={(f) => setFile("G3", f)} />
      ) : q!.type === "creditinfo" ? (
        <CreditInfoField q={q!} answers={answers} file={files.F8 ?? null} onAnswer={setField} onFile={(f) => setFile("F8", f)} business={name} />
      ) : (
        <QuestionField key={q!.id} q={q!} value={answers[q!.id]} onChange={q!.type === "yesno" || q!.type === "scale" || q!.type === "choice" ? choose : (v) => setAnswer(q!.id, v)} />
      )}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => go(pos - 1)} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-canvas">
          Back
        </button>
        <button type="submit" disabled={!answered} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
          {last ? "Generate my report" : q!.required ? "Next" : answers[q!.id] === undefined ? "Skip" : "Next"}
        </button>
        {!answered && <p className="text-sm text-muted">{q!.type === "taxclearance" ? "Fill in every field and attach the certificate to continue." : q!.type === "creditinfo" ? "Sign the declaration or attach your credit report to continue." : "Answer this question to continue."}</p>}
      </div>
    </form>
  );
}

const gradeTone: Record<string, string> = {
  A: "from-brand-900 to-brand-700 text-white",
  B: "from-brand-700 to-brand-500 text-white",
  C: "from-amber-600 to-amber-500 text-white",
  D: "from-orange-700 to-orange-600 text-white",
  E: "from-red-800 to-red-700 text-white",
};

function Report({ result, name, type, answers, files, onEdit, onRestart }: { result: ReturnType<typeof score>; name: string; type: string; answers: Answers; files: Record<string, File | null>; onEdit: () => void; onRestart: () => void }) {
  const tax = taxClearance(answers);
  const fmt = (d: Answers[string]) => (typeof d === "string" && d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "–");
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <article className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">EHIRA self-assessment report</p>
          <h3 className="mt-1 text-2xl font-bold text-ink">{name || "Your business"}</h3>
          <p className="text-sm text-muted">
            {type} · {today} · Self-assessed, not verified
          </p>
        </div>
        <div className="flex gap-3 print:hidden">
          <button type="button" onClick={() => window.print()} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Print or save as PDF
          </button>
          <button type="button" onClick={onEdit} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-canvas">
            Change answers
          </button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className={`rounded-xl bg-gradient-to-br p-6 md:col-span-2 ${gradeTone[result.grade]}`}>
          <p className="text-sm opacity-80">Business grade</p>
          <p className="mt-1 text-6xl font-extrabold">{result.grade}</p>
          <p className="mt-2 text-xl font-bold">{result.label}</p>
          <p className="mt-1 opacity-90">{result.meaning}</p>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Enterprise Health Score</p>
            <p className="mt-1 text-3xl font-extrabold text-ink">
              {Math.round(result.total)} <span className="text-base font-semibold text-muted">/ 100</span>
            </p>
          </div>
          <div className="rounded-xl border border-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Readiness rating</p>
            <p className="mt-1 text-xl font-bold text-ink">{result.readiness}</p>
          </div>
        </div>
      </div>

      {result.flags.length > 0 && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900">
          <h4 className="font-bold">Red flags that limit the grade</h4>
          <p className="mt-1 text-sm">
            The score alone would give grade {result.scoreGrade}. These answers cap the grade until they are resolved:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {result.flags.map((f) => (
              <li key={f.flag}>
                {f.flag}: highest possible grade {f.cap}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-line bg-white p-5">
        <h4 className="font-bold text-ink">Tax clearance certificate</h4>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">TIN</dt><dd className="font-medium text-ink">{answers.G3_TIN ?? "–"}</dd></div>
          <div><dt className="text-muted">Certificate number</dt><dd className="font-medium text-ink">{answers.G3_NO ?? "–"}</dd></div>
          <div><dt className="text-muted">Issued</dt><dd className="font-medium text-ink">{fmt(answers.G3_ISSUE)}</dd></div>
          <div><dt className="text-muted">Valid until</dt><dd className="font-medium text-ink">{fmt(answers.G3_EXPIRY)}{tax === "expired" && <span className="text-red-700"> (expired)</span>}</dd></div>
          <div className="sm:col-span-2"><dt className="text-muted">File</dt><dd className="font-medium text-ink">{files.G3?.name ?? answers.G3_FILE ?? "–"}</dd></div>
        </dl>
        <p className="mt-3 text-xs text-muted">Status: attached, not yet verified. Kena verifies it with the issuing tax authority in the verified EHIRA.</p>
      </section>

      <section className="rounded-xl border border-line bg-white p-5">
        <h4 className="font-bold text-ink">Credit information</h4>
        {answers.F8_ROUTE === "declaration" ? (
          <>
            <p className="mt-2 text-sm text-ink">{declarationText(name)}</p>
            <p className="mt-2 text-sm text-muted">
              Signed by {answers.F8_SIGNER} ({answers.F8_POSITION}) on {fmt(answers.F8_DATE)}.
            </p>
          </>
        ) : (
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div><dt className="text-muted">NBE credit report dated</dt><dd className="font-medium text-ink">{fmt(answers.F8_REPORT_DATE)}</dd></div>
            <div><dt className="text-muted">File</dt><dd className="font-medium text-ink">{files.F8?.name ?? answers.F8_FILE ?? "–"}</dd></div>
            <div className="sm:col-span-2"><dt className="text-muted">Loan more than 90 days overdue</dt><dd className="font-medium text-ink">{answers.F8 === "yes" ? "Yes, reported" : "None reported"}</dd></div>
          </dl>
        )}
        <p className="mt-3 text-xs text-muted">Status: provided by the business, not yet reviewed. Kena analysts review it in the verified EHIRA.</p>
      </section>

      <section>
        <h4 className="text-lg font-bold text-ink">Scores by dimension</h4>
        <ul className="mt-3 space-y-3">
          {result.dimensions.filter((d) => d.weight > 0).map((d) => (
            <li key={d.id}>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-ink">
                  {d.name} <span className="text-muted">({d.weight}% of total)</span>
                </span>
                <span className="font-semibold text-ink">{d.score === null ? "Not scored" : Math.round(d.score)}</span>
              </div>
              <div className="mt-1 h-2.5 rounded-full bg-line">
                <div
                  className={`h-2.5 rounded-full ${d.score === null ? "" : d.score >= 80 ? "bg-brand-600" : d.score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${d.score ?? 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-bold text-ink">Financial ratios</h4>
        <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="p-3">Ratio</th>
                <th className="p-3">Formula</th>
                <th className="p-3 text-right">Value</th>
                <th className="p-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {result.ratios.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="p-3 font-medium text-ink">{r.name}</td>
                  <td className="p-3 text-muted">{r.formula}</td>
                  <td className="p-3 text-right text-ink">{r.display}</td>
                  <td className="p-3 text-right font-semibold text-ink">{r.score ?? "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {result.actions.length > 0 && (
        <section>
          <h4 className="text-lg font-bold text-ink">Priority actions</h4>
          <p className="mt-1 text-sm text-muted">Ordered by how much each gap holds back your overall score.</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink">
            {result.actions.slice(0, 8).map((a) => (
              <li key={a.text}>
                <span className="font-semibold">{a.dimension}:</span> {a.text}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="rounded-xl border border-line bg-canvas p-5 print:hidden">
        <h4 className="font-bold text-ink">Next steps on Kena</h4>
        <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-brand-700">
          <li><Link href="/advisors" className="hover:underline">Find an advisor</Link></li>
          <li><Link href="/programs" className="hover:underline">Join a program</Link></li>
          <li><Link href="/credit-center" className="hover:underline">Credit Management Center</Link></li>
          <li><Link href="/recovery" className="hover:underline">Business Recovery</Link></li>
          <li><Link href="/academy" className="hover:underline">Academy courses</Link></li>
        </ul>
      </section>

      <p className="text-xs text-muted">
        EHIRA is a decision-support and readiness tool. It does not replace a credit rating, an audit, legal due diligence or a lender&apos;s
        decision. This report is based on your own answers and has not been verified by Kena.
      </p>

      <button type="button" onClick={onRestart} className="text-sm font-semibold text-brand-700 hover:underline print:hidden">
        Start a new assessment
      </button>
    </article>
  );
}
