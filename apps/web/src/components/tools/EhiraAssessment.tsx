"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { businessTypes, dimensions, questions, screening, typeWeights, type Answers, type BusinessType, type DimensionId, type Question } from "@/lib/ehira/model";
import { isVisible, score } from "@/lib/ehira/score";

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

export function EhiraAssessment() {
  const saved = useSyncExternalStore(subscribeNever, readSaved, () => EMPTY);
  const [own, setState] = useState<Draft | null>(null);
  const state = own ?? saved;
  const [step, setStep] = useState(-1);
  const { answers, type, name } = state;

  const update = (patch: Partial<Draft>) => {
    const next = { ...state, ...patch };
    setState(next);
    save(next);
  };
  const setAnswer = (id: string, v: Answers[string]) => update({ answers: { ...answers, [id]: v } });

  const bt = (businessTypes.some((b) => b.id === type) ? type : "sme") as BusinessType;
  const result = useMemo(() => score(answers, bt), [answers, bt]);

  // Dimensions with no weight for this business type are skipped.
  const steps = allSteps.filter((s) => s.id === "screening" || typeWeights[bt][s.id as DimensionId] > 0);
  const current = steps[step];
  const visibleIds = current ? current.ids.filter((id) => {
    const q = questions.find((x) => x.id === id);
    return !q || isVisible(q, answers, bt);
  }) : [];
  const missing = visibleIds.filter((id) => {
    const q = questions.find((x) => x.id === id);
    const required = q ? q.required : true;
    return required && answers[id] === undefined;
  });

  const go = (to: number) => {
    setStep(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (step === -1)
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
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={!type} onClick={() => go(0)} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
            {Object.keys(answers).length ? "Continue the assessment" : "Start the assessment"}
          </button>
          {Object.keys(answers).length > 0 && (
            <button type="button" onClick={() => update({ answers: {} })} className="text-sm font-semibold text-brand-700 hover:underline">
              Clear my answers and start over
            </button>
          )}
        </div>
        <p className="text-xs text-muted">About 15 minutes. Your answers stay in this browser only and are not sent to EABIX.</p>
      </div>
    );

  if (step >= steps.length) return <Report result={result} name={name} type={businessTypes.find((t) => t.id === bt)!.label} onEdit={() => go(0)} onRestart={() => { update({ answers: {} }); go(-1); }} />;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <p className="text-sm font-semibold text-brand-700">
          Step {step + 1} of {steps.length}
        </p>
        <div className="mt-2 h-2 rounded-full bg-line">
          <div className="h-2 rounded-full bg-brand-600 transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
        <h3 className="mt-4 text-2xl font-bold text-ink">{current.title}</h3>
        {current.intro && <p className="mt-1 text-muted">{current.intro}</p>}
      </div>
      <div className="space-y-4">
        {visibleIds.map((id) => {
          const q = questions.find((x) => x.id === id) ?? { ...screening.find((s) => s.id === id)!, type: "yesno" as const, required: true as const };
          return <QuestionField key={id} q={q} value={answers[id]} onChange={(v) => setAnswer(id, v)} />;
        })}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => go(step - 1)} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-canvas">
          Back
        </button>
        <button
          type="button"
          disabled={missing.length > 0}
          onClick={() => go(step + 1)}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
        >
          {step === steps.length - 1 ? "See my results" : "Next"}
        </button>
        {missing.length > 0 && <p className="text-sm text-muted">Answer the remaining {missing.length === 1 ? "question" : `${missing.length} questions`} to continue.</p>}
      </div>
    </div>
  );
}

const gradeTone: Record<string, string> = {
  A: "from-brand-900 to-brand-700 text-white",
  B: "from-brand-700 to-brand-500 text-white",
  C: "from-amber-600 to-amber-500 text-white",
  D: "from-orange-700 to-orange-600 text-white",
  E: "from-red-800 to-red-700 text-white",
};

function Report({ result, name, type, onEdit, onRestart }: { result: ReturnType<typeof score>; name: string; type: string; onEdit: () => void; onRestart: () => void }) {
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
