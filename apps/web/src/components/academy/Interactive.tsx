"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProCourse, QuizQuestion, Scenario } from "@/data/academy/types";
import { examHref, passMark, proCourseHref } from "@/data/academy/paths";

/**
 * Progress, quizzes, decision scenarios, the final exam and the certificate.
 * Progress is remembered in this browser per course (completed modules and the
 * best exam result); storage can be blocked, and the pages work without it.
 */
const KEY = "investopia-academy-progress";
const EVENT = "investopia-academy-progress";

type Result = { score: number; total: number; date: string; name?: string; id?: string };
type Progress = Record<string, { done: string[]; exam?: Result }>;

function read(): Progress {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

function write(p: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Storage unavailable: progress is not remembered.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useProgress(course: string) {
  const [state, setState] = useState<{ done: string[]; exam?: Result }>({ done: [] });
  useEffect(() => {
    const sync = () => setState(read()[course] ?? { done: [] });
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [course]);
  return state;
}

function markDone(course: string, module: string) {
  const p = read();
  const c = p[course] ?? { done: [] };
  if (!c.done.includes(module)) write({ ...p, [course]: { ...c, done: [...c.done, module] } });
}

function saveExam(course: string, r: Result) {
  const p = read();
  const c = p[course] ?? { done: [] };
  if (!c.exam || r.score / r.total >= c.exam.score / c.exam.total) write({ ...p, [course]: { ...c, exam: r } });
}

export function CourseProgress({ course }: { course: ProCourse }) {
  const { done, exam } = useProgress(course.slug);
  const count = course.modules.filter((m) => done.includes(m.id)).length;
  const next = course.modules.find((m) => !done.includes(m.id));
  const total = course.modules.length;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Link
        href={next ? proCourseHref(course.slug, next.slug) : examHref(course.slug)}
        className="rounded-lg bg-gold-400 px-5 py-3 font-semibold text-ink hover:bg-gold-500"
      >
        {!next ? (exam ? "Review the final exam" : "Take the final exam") : count > 0 ? "Continue the course" : "Start the course"}
      </Link>
      <div className="min-w-48 flex-1">
        <div className="h-2 overflow-hidden rounded-full bg-white/20" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={count}>
          <div className="h-full rounded-full bg-gold-400 transition-all duration-700" style={{ width: `${(count / total) * 100}%` }} />
        </div>
        <p className="mt-1 text-sm text-brand-100">
          {count} of {total} modules completed
          {exam && ` · Final exam ${Math.round((exam.score / exam.total) * 100)}%`}
        </p>
      </div>
    </div>
  );
}

export function DoneBadge({ course, module }: { course: string; module: string }) {
  const { done } = useProgress(course);
  if (!done.includes(module)) return null;
  return <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">✓ Completed</span>;
}

function Options({
  q,
  picked,
  onPick,
  reveal,
}: {
  q: { question: string; options: string[]; answer: number };
  picked: number | null;
  onPick: (i: number) => void;
  reveal: boolean;
}) {
  return (
    <div className="mt-3 grid gap-2" role="radiogroup" aria-label={q.question}>
      {q.options.map((o, oi) => {
        const isPicked = picked === oi;
        const showRight = reveal && picked !== null && oi === q.answer;
        const showWrong = reveal && isPicked && oi !== q.answer;
        return (
          <button
            key={oi}
            type="button"
            role="radio"
            aria-checked={isPicked}
            disabled={reveal && picked !== null}
            onClick={() => onPick(oi)}
            className={`rounded-lg border px-4 py-2.5 text-left transition-colors ${
              showRight
                ? "border-brand-500 bg-brand-50 font-semibold text-brand-900"
                : showWrong
                  ? "border-red-300 bg-red-50 text-red-900"
                  : isPicked
                    ? "border-brand-600 bg-brand-50 text-ink"
                    : "border-line bg-white text-ink hover:border-brand-500 disabled:hover:border-line"
            }`}
          >
            {showRight ? "✓ " : showWrong ? "✗ " : ""}
            {o}
          </button>
        );
      })}
    </div>
  );
}

/** A realistic decision with instant feedback. */
export function ScenarioCard({ s }: { s: Scenario }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <aside className="mt-6 rounded-xl border-2 border-gold-400 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">Your decision</p>
      <p className="mt-1 font-semibold text-ink">{s.title}</p>
      <p className="mt-2 text-ink">{s.situation}</p>
      <p className="mt-3 font-semibold text-ink">{s.question}</p>
      <Options q={s} picked={picked} onPick={setPicked} reveal />
      {picked !== null && (
        <div role="status" className="mt-3 text-sm text-ink">
          <strong className={picked === s.answer ? "text-brand-700" : "text-red-700"}>{picked === s.answer ? "Sound decision." : "Think again."}</strong> {s.explain}
          {picked !== s.answer && (
            <button type="button" onClick={() => setPicked(null)} className="ml-2 font-semibold text-brand-700 hover:underline">
              Try again
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

export function ModuleQuiz({ course, module, questions }: { course: string; module: string; questions: QuizQuestion[] }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [round, setRound] = useState(0);
  const { done } = useProgress(course);
  const answered = picked.filter((p) => p !== null).length;
  const right = picked.filter((p, i) => p === questions[i].answer).length;
  const passed = right / questions.length >= passMark / 100;
  return (
    <div>
      <p className="text-muted">Answer every question. Score {passMark}% or more to complete the module.</p>
      <ol className="mt-6 space-y-6">
        {questions.map((q, qi) => (
          <li key={`${round}-${qi}`} className="rounded-xl border border-line bg-white p-5">
            <p className="font-semibold text-ink">
              {qi + 1}. {q.q}
            </p>
            <Options q={{ question: q.q, options: q.options, answer: q.answer }} picked={picked[qi]} onPick={(oi) => setPicked((p) => p.map((v, i) => (i === qi ? oi : v)))} reveal />
            {picked[qi] !== null && (
              <p role="status" className="mt-3 text-sm text-ink">
                <strong className={picked[qi] === q.answer ? "text-brand-700" : "text-red-700"}>{picked[qi] === q.answer ? "Correct." : "Not quite."}</strong> {q.explain}
              </p>
            )}
          </li>
        ))}
      </ol>
      {answered === questions.length && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-brand-50 p-5">
          <p className="font-semibold text-brand-900">
            You answered {right} of {questions.length} correctly. {passed ? "Module passed." : `You need ${Math.ceil((passMark / 100) * questions.length)} to pass.`}
          </p>
          {passed && !done.includes(module) && (
            <button type="button" onClick={() => markDone(course, module)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              Mark module as completed
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setPicked(questions.map(() => null));
              setRound((r) => r + 1);
            }}
            className="rounded-lg border border-brand-500 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-white"
          >
            Try the quiz again
          </button>
        </div>
      )}
      {done.includes(module) && <p className="mt-6 font-semibold text-brand-700">✓ Module completed</p>}
    </div>
  );
}

const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

function certificateId(course: ProCourse) {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rnd = Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => a[b % 32]).join("");
  return `INV/ACAD/${course.id.toUpperCase()}/${new Date().getFullYear()}/${rnd}`;
}

/** The final exam: answers are revealed only after submitting; a pass unlocks the certificate. */
export function FinalExam({ course }: { course: ProCourse }) {
  const qs = course.exam;
  const { done, exam } = useProgress(course.slug);
  const [picked, setPicked] = useState<(number | null)[]>(() => qs.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [round, setRound] = useState(0);
  const missing = course.modules.filter((m) => !done.includes(m.id));
  const answered = picked.filter((p) => p !== null).length;
  const right = picked.filter((p, i) => p === qs[i].answer).length;
  const pct = Math.round((right / qs.length) * 100);

  function submit() {
    setSubmitted(true);
    saveExam(course.slug, { score: right, total: qs.length, date: new Date().toISOString(), id: exam?.id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="print:hidden">
      {missing.length > 0 && (
        <p className="rounded-xl bg-gold-100 p-4 text-ink">
          You can take the exam now, but it covers all five modules. Not yet completed:{" "}
          {missing.map((m, i) => (
            <span key={m.id}>
              {i > 0 && ", "}
              <Link href={proCourseHref(course.slug, m.slug)} className="font-semibold text-brand-700 hover:underline">
                {m.title}
              </Link>
            </span>
          ))}
          .
        </p>
      )}
      {submitted && (
        <div role="status" className={`mt-6 rounded-2xl p-6 ${pct >= passMark ? "bg-brand-900 text-white" : "bg-red-50 text-red-900"}`}>
          <p className="text-2xl font-bold">
            {right} of {qs.length} correct ({pct}%)
          </p>
          <p className="mt-1">{pct >= passMark ? "Congratulations, you passed. Your certificate is below." : `The pass mark is ${passMark}%. Review the explanations below, revisit the modules and try again.`}</p>
          <button
            type="button"
            onClick={() => {
              setPicked(qs.map(() => null));
              setSubmitted(false);
              setRound((r) => r + 1);
            }}
            className={`mt-4 rounded-lg px-4 py-2 text-sm font-semibold ${pct >= passMark ? "bg-white/15 text-white hover:bg-white/25" : "border border-red-300 hover:bg-white"}`}
          >
            Take the exam again
          </button>
        </div>
      )}
      <ol className="mt-6 space-y-6">
        {qs.map((q, qi) => (
          <li key={`${round}-${qi}`} className="rounded-xl border border-line bg-white p-5">
            <p className="font-semibold text-ink">
              {qi + 1}. {q.q}
            </p>
            <Options
              q={{ question: q.q, options: q.options, answer: q.answer }}
              picked={picked[qi]}
              onPick={(oi) => !submitted && setPicked((p) => p.map((v, i) => (i === qi ? oi : v)))}
              reveal={submitted}
            />
            {submitted && (
              <p className="mt-3 text-sm text-ink">
                <strong className={picked[qi] === q.answer ? "text-brand-700" : "text-red-700"}>{picked[qi] === q.answer ? "Correct." : "Not quite."}</strong> {q.explain}
              </p>
            )}
          </li>
        ))}
      </ol>
      {!submitted && (
        <div className="sticky bottom-4 mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white/95 p-4 shadow-lg backdrop-blur">
          <p className="text-ink">
            {answered} of {qs.length} answered
          </p>
          <button type="button" disabled={answered < qs.length} onClick={submit} className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
            Submit the exam
          </button>
        </div>
      )}
    </div>
  );
}

export function Certificate({ course }: { course: ProCourse }) {
  const { exam } = useProgress(course.slug);
  const [name, setName] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setName(exam?.name ?? ""), 0);
    return () => clearTimeout(t);
  }, [exam?.name]);
  if (!exam || exam.score / exam.total < passMark / 100) return null;
  const id = exam.id;

  function issue() {
    saveExam(course.slug, { ...exam!, name: name.trim(), id: id ?? certificateId(course) });
    setTimeout(() => window.print(), 50);
  }

  return (
    <section className="mt-12 print:mt-0">
      <div className="print:hidden rounded-2xl border border-gold-400 bg-gold-100 p-6">
        <h2 className="text-xl font-bold text-ink">Your certificate of completion</h2>
        <p className="mt-1 text-muted">Type your name as it should appear, then download the certificate (choose &ldquo;Save as PDF&rdquo; in the print window).</p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block min-w-64 flex-1 text-sm font-semibold text-ink">
            Full name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <button type="button" disabled={!name.trim()} onClick={issue} className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
            Download certificate
          </button>
        </div>
      </div>
      <div className="certificate hidden break-inside-avoid print:flex">
        <div className="flex h-[184mm] w-full flex-col items-center justify-center border-[6px] border-double border-brand-700 p-12 text-center font-serif text-black">
          <p className="text-[11pt] uppercase tracking-[0.3em] text-brand-700">Investopia Academy</p>
          <p className="mt-6 text-[30pt] font-bold">Certificate of Completion</p>
          <p className="mt-6 text-[12pt]">This certifies that</p>
          <p className="mt-3 border-b border-black px-10 pb-1 text-[24pt] font-bold">{name || exam.name}</p>
          <p className="mt-5 max-w-[200mm] text-[12pt]">
            has completed the online course <strong>{course.title}</strong> ({course.subtitle}) and passed its final examination with a score of{" "}
            {Math.round((exam.score / exam.total) * 100)}%.
          </p>
          <div className="mt-14 grid w-full max-w-[240mm] grid-cols-[1fr_1fr_1.4fr] gap-10 text-[10pt]">
            <p className="border-t border-black pt-1">Date: {longDate(exam.date)}</p>
            <p className="border-t border-black pt-1">Investopia Academy</p>
            <p className="border-t border-black pt-1">Certificate no. {id ?? ""}</p>
          </div>
          <p className="mt-10 text-[9pt]">Investopia is a platform by Erudite Africa Investments PLC · investopia.et</p>
        </div>
      </div>
    </section>
  );
}
