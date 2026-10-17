"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { businessTypes, dimensions, questions, screening, typeWeights, type Answers, type BusinessType, type DimensionId, type Question } from "@/lib/ehira/model";
import { isVisible, score, taxClearance } from "@/lib/ehira/score";

const STORAGE_KEY = "eabix-ehira-draft-v2";

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

const TAX_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const TAX_MAX_BYTES = 5 * 1024 * 1024;

/** The certificate details are complete and the file is attached in this browser session. */
function taxComplete(a: Answers, file: File | null) {
  const s = (k: string) => (typeof a[k] === "string" ? (a[k] as string).trim() : "");
  return /^\d{10}$/.test(s("G3_TIN")) && s("G3_NO") !== "" && s("G3_ISSUE") !== "" && s("G3_EXPIRY") !== "" && s("G3_EXPIRY") >= s("G3_ISSUE") && file !== null;
}

function TaxClearanceField({ q, answers, file, onAnswer, onFile }: { q: Question; answers: Answers; file: File | null; onAnswer: (id: string, v: string) => void; onFile: (f: File | null) => void }) {
  const [error, setError] = useState("");
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
      <div className="mt-4">
        <label className="block text-sm font-medium text-ink">
          Certificate file <span className="font-normal text-muted">(PDF, JPG or PNG, up to 5 MB)</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && !TAX_TYPES.includes(f.type)) return setError("Please attach a PDF, JPG or PNG file.");
              if (f && f.size > TAX_MAX_BYTES) return setError("The file is larger than 5 MB.");
              setError("");
              onFile(f);
            }}
            className="mt-2 block w-full text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand-700"
          />
        </label>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
        {file && <p className="mt-2 text-sm text-ink">Attached: {file.name} ({Math.ceil(file.size / 1024).toLocaleString("en-US")} KB)</p>}
        {!file && val("G3_FILE") && <p className="mt-2 text-sm text-muted">You attached {val("G3_FILE")} earlier. Files are not kept after you leave the page, so please attach it again.</p>}
      </div>
      {status === "expired" && (
        <p className="mt-4 rounded-lg bg-gold-100 p-3 text-sm text-ink">This certificate has expired. You can continue, but an expired certificate caps your grade at C.</p>
      )}
      <p className="mt-4 text-xs text-muted">
        The file stays in this browser and is not sent to EABIX. In the verified EHIRA, an analyst checks the certificate with the issuing tax authority.
      </p>
    </fieldset>
  );
}

export function EhiraAssessment() {
  const saved = useSyncExternalStore(subscribeNever, readSaved, () => EMPTY);
  const [own, setState] = useState<Draft | null>(null);
  const state = own ?? saved;
  const [pos, setPos] = useState(-1);
  const [taxFile, setTaxFile] = useState<File | null>(null);
  const { answers, type, name } = state;

  const update = (patch: Partial<Draft>) => {
    const next = { ...state, ...patch };
    setState(next);
    save(next);
  };
  const setAnswer = (id: string, v: Answers[string]) => update({ answers: { ...answers, [id]: v } });

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
  const answered = q ? (q.type === "taxclearance" ? taxComplete(answers, taxFile) : !q.required || answers[q.id] !== undefined) : false;

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
          Have your tax clearance certificate ready (PDF or photo). It is mandatory, and you will need your TIN, the certificate number and its dates.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={!type} onClick={() => go(0)} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
            {Object.keys(answers).length ? "Continue the assessment" : "Start the assessment"}
          </button>
          {Object.keys(answers).length > 0 && (
            <button type="button" onClick={() => { update({ answers: {} }); setTaxFile(null); }} className="text-sm font-semibold text-brand-700 hover:underline">
              Clear my answers and start over
            </button>
          )}
        </div>
        <p className="text-xs text-muted">One question at a time, about 15 minutes. Your report appears at the end. Your answers stay in this browser only and are not sent to EABIX.</p>
      </div>
    );

  if (pos >= items.length)
    return (
      <Report
        result={result}
        name={name}
        type={businessTypes.find((t) => t.id === bt)!.label}
        answers={answers}
        taxFile={taxFile}
        onEdit={() => go(0)}
        onRestart={() => { update({ answers: {} }); setTaxFile(null); go(-1); }}
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
        <TaxClearanceField
          q={q!}
          answers={answers}
          file={taxFile}
          onAnswer={setAnswer}
          onFile={(f) => {
            setTaxFile(f);
            setAnswer("G3_FILE", f?.name);
          }}
        />
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
        {!answered && <p className="text-sm text-muted">{q!.type === "taxclearance" ? "Fill in every field and attach the certificate to continue." : "Answer this question to continue."}</p>}
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

function Report({ result, name, type, answers, taxFile, onEdit, onRestart }: { result: ReturnType<typeof score>; name: string; type: string; answers: Answers; taxFile: File | null; onEdit: () => void; onRestart: () => void }) {
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
          <div className="sm:col-span-2"><dt className="text-muted">File</dt><dd className="font-medium text-ink">{taxFile?.name ?? answers.G3_FILE ?? "–"}</dd></div>
        </dl>
        <p className="mt-3 text-xs text-muted">Status: attached, not yet verified. EABIX verifies it with the issuing tax authority in the verified EHIRA.</p>
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
        <h4 className="font-bold text-ink">Next steps on EABIX</h4>
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
        decision. This report is based on your own answers and has not been verified by EABIX.
      </p>

      <button type="button" onClick={onRestart} className="text-sm font-semibold text-brand-700 hover:underline print:hidden">
        Start a new assessment
      </button>
    </article>
  );
}
