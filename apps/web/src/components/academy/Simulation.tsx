"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProCourse, SimOption, SimTask, Simulation } from "@/data/academy/types";
import { examHref, passMark, proCourseHref } from "@/data/academy/paths";
export { simulationHref } from "@/data/academy/paths";

/**
 * The officer simulation: an inbox of realistic items the learner works through
 * in order, as an officer at a fictional bank. Choices move the desk's meters
 * and are scored; some bring a follow-up item that shows the consequence. The
 * picks and the hand-over memo are remembered in this browser per course.
 */
const KEY = "investopia-academy-sim";
const EVENT = "investopia-academy-sim";
const START = 60;

type SimState = { picks: Record<string, number>; memo: string; finished?: string };
type Store = Record<string, SimState>;
const blank = (): SimState => ({ picks: {}, memo: "" });

// Options are written best-first or in any order; show them in a fixed order
// shuffled by the item's id, so the best answer's place gives nothing away.
function shuffled(task: SimTask): number[] {
  let h = 2166136261;
  for (const ch of task.id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const idx = task.options.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
    const j = h % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

let visit: Store | null = null;

function read(): Store {
  if (visit) return visit;
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

function write(course: string, s: SimState) {
  const all = { ...read(), [course]: s };
  visit = all;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable: kept for this visit only.
  }
  window.dispatchEvent(new Event(EVENT));
}

function useSimState(course: string) {
  const [s, setS] = useState<SimState>(blank);
  useEffect(() => {
    const sync = () => setS(read()[course] ?? blank());
    const t = setTimeout(sync, 0);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      clearTimeout(t);
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [course]);
  return s;
}

/** The items in the order the learner meets them: the week's items, then any follow-ups their choices triggered. */
function playOrder(sim: Simulation, picks: Record<string, number>) {
  const follow = new Map((sim.followUps ?? []).map((t) => [t.id, t]));
  const order: SimTask[] = [...sim.tasks];
  for (let i = 0; i < order.length; i++) {
    const pick = picks[order[i].id];
    const next = pick === undefined ? undefined : order[i].options[pick]?.next;
    const f = next ? follow.get(next) : undefined;
    if (f && !order.includes(f)) order.push(f);
  }
  return order;
}

function results(sim: Simulation, picks: Record<string, number>) {
  const order = playOrder(sim, picks);
  const played = order.filter((t) => picks[t.id] !== undefined);
  const chosen = played.map((t) => t.options[picks[t.id]]);
  const meters = Object.fromEntries(
    sim.meters.map((m) => [m.id, Math.max(0, Math.min(100, START + chosen.reduce((sum, o) => sum + (o.effects[m.id] ?? 0), 0)))]),
  );
  const points = chosen.reduce((sum, o) => sum + o.score, 0);
  const score = played.length ? Math.round((points / (played.length * 3)) * 100) : 0;
  const current = order.find((t) => picks[t.id] === undefined);
  return { order, played, meters, score, current, done: !current };
}

/** Whether the learner has finished the course's simulation with a pass, and the score. */
export function useSimulationResult(course: ProCourse) {
  const s = useSimState(course.slug);
  if (!course.simulation) return { required: false, passed: true, score: 0 };
  const r = results(course.simulation, s.picks);
  return { required: true, passed: r.done && r.score >= passMark, score: r.score, done: r.done };
}

const grade = ["Poor choice", "Weak", "Acceptable", "Best practice"] as const;
const gradeStyle = ["bg-red-50 text-red-800 border-red-200", "bg-gold-100 text-ink border-gold-400", "bg-brand-50 text-brand-700 border-brand-200", "bg-brand-50 text-brand-700 border-brand-500"];
const channelLabel: Record<SimTask["channel"], string> = { email: "Email", call: "Phone call", visit: "Customer visit", memo: "Memo", meeting: "Meeting", system: "System alert" };

function Meters({ sim, values, deltas }: { sim: Simulation; values: Record<string, number>; deltas?: Record<string, number> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {sim.meters.map((m) => {
        const v = values[m.id];
        const d = deltas?.[m.id];
        return (
          <div key={m.id} className="rounded-xl border border-line bg-white p-3" title={m.help}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-semibold text-ink">{m.label}</span>
              <span className="tabular-nums text-muted">
                {v}
                {d ? <span className={d > 0 ? " text-brand-700" : " text-red-700"}>{` ${d > 0 ? "+" : ""}${d}`}</span> : null}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-canvas" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} aria-label={m.label}>
              <div className={`h-full rounded-full ${v >= 60 ? "bg-brand-600" : v >= 40 ? "bg-gold-400" : "bg-red-600"}`} style={{ width: `${v}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Exhibit({ e }: { e: NonNullable<SimTask["exhibit"]> }) {
  return (
    <figure className="mt-4 overflow-hidden rounded-xl border border-line">
      <figcaption className="bg-canvas px-4 py-2 text-sm font-semibold text-ink">{e.title}</figcaption>
      <table className="w-full text-sm">
        <tbody>
          {e.rows.map((r) => (
            <tr key={r.label} className="border-t border-line">
              <td className="px-4 py-2 text-muted">{r.label}</td>
              <td className="px-4 py-2 text-right font-semibold tabular-nums text-ink">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {e.note && <p className="border-t border-line px-4 py-2 text-xs text-muted">{e.note}</p>}
    </figure>
  );
}

function Outcome({ o, course, task, sim }: { o: SimOption; course: ProCourse; task: SimTask; sim: Simulation }) {
  const m = course.modules.find((x) => x.id === task.module);
  return (
    <div className={`mt-5 rounded-xl border p-4 ${gradeStyle[o.score]}`} role="status">
      <p className="font-bold">{grade[o.score]}</p>
      <p className="mt-1 text-ink">{o.outcome}</p>
      <p className="mt-2 flex flex-wrap gap-2 text-xs">
        {sim.meters
          .filter((x) => o.effects[x.id])
          .map((x) => (
            <span key={x.id} className="rounded-full bg-white px-2 py-0.5 font-semibold text-ink">
              {x.label} {o.effects[x.id] > 0 ? "+" : ""}
              {o.effects[x.id]}
            </span>
          ))}
      </p>
      {m && (
        <Link href={proCourseHref(course.slug, m.slug)} className="mt-3 inline-block text-sm font-semibold text-brand-700 underline-offset-4 hover:underline">
          Revisit {m.title} →
        </Link>
      )}
    </div>
  );
}

export function SimulationDesk({ course }: { course: ProCourse }) {
  const sim = course.simulation!;
  const s = useSimState(course.slug);
  const r = results(sim, s.picks);
  const [viewing, setViewing] = useState<string | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [justDecided, setJustDecided] = useState<string | null>(null);
  const shown = (viewing && r.order.find((t) => t.id === viewing && s.picks[t.id] !== undefined)) || (justDecided && r.order.find((t) => t.id === justDecided)) || r.current;
  const picked = shown ? s.picks[shown.id] : undefined;
  const started = Object.keys(s.picks).length > 0;

  function decide() {
    if (!shown || choice === null) return;
    write(course.slug, { ...s, picks: { ...s.picks, [shown.id]: choice } });
    setJustDecided(shown.id);
    setChoice(null);
  }

  function nextItem() {
    setJustDecided(null);
    setViewing(null);
    window.scrollTo({ top: document.getElementById("desk")?.offsetTop ?? 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-8">
      <details open={!started} className="rounded-2xl border border-line bg-white p-6 print:hidden">
        <summary className="cursor-pointer text-lg font-bold text-ink">
          Your role: {sim.role} · {sim.title}
        </summary>
        <div className="mt-4 space-y-3 text-ink">
          {sim.setting.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        {sim.authority && <Exhibit e={sim.authority} />}
        <p className="mt-4 text-sm text-muted">
          {sim.tasks.length} items reach your desk, and some choices bring a follow-up. Each decision is scored from best practice to poor choice and moves your
          desk&apos;s meters, which all start at {START}. Finish with {passMark}% or more and write your hand-over note to complete the simulation.
        </p>
      </details>

      <section id="desk" className="scroll-mt-24 print:hidden">
        <Meters sim={sim} values={r.meters} deltas={justDecided ? shown?.options[s.picks[justDecided]]?.effects : undefined} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr] print:hidden">
        <nav aria-label="Inbox" className="rounded-2xl border border-line bg-white p-3">
          <p className="px-2 pb-2 text-sm font-semibold uppercase tracking-wide text-muted">Inbox</p>
          <ol className="space-y-1">
            {r.order.map((t) => {
              const p = s.picks[t.id];
              const active = shown?.id === t.id;
              const open = p !== undefined || t.id === r.current?.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    disabled={!open}
                    onClick={() => {
                      setViewing(p !== undefined ? t.id : null);
                      setJustDecided(null);
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${active ? "bg-brand-600 text-white" : open ? "text-ink hover:bg-canvas" : "text-muted opacity-60"}`}
                  >
                    <span className="block text-xs opacity-80">
                      {t.when} · {channelLabel[t.channel]}
                      {p !== undefined && ` · ${grade[t.options[p].score]}`}
                    </span>
                    <span className="block font-semibold">{t.subject}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div>
          {shown ? (
            <article className="rounded-2xl border border-line bg-white p-6">
              <p className="text-sm text-muted">
                {shown.when} · {channelLabel[shown.channel]} · from {shown.from}
              </p>
              <h2 className="mt-1 text-xl font-bold text-ink">{shown.subject}</h2>
              <div className="mt-3 space-y-3 text-ink">
                {shown.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              {shown.exhibit && <Exhibit e={shown.exhibit} />}
              <p className="mt-5 font-semibold text-ink">{shown.ask}</p>
              <ul className="mt-3 space-y-2">
                {shuffled(shown).map((i) => {
                  const o = shown.options[i];
                  const isPicked = picked === i;
                  const best = picked !== undefined && o.score === 3;
                  return (
                    <li key={o.text}>
                      <label
                        className={`flex gap-3 rounded-xl border p-3 ${picked !== undefined ? (isPicked ? "border-brand-600 bg-brand-50" : best ? "border-brand-200" : "border-line opacity-80") : choice === i ? "border-brand-600 bg-brand-50" : "border-line hover:border-brand-500"} ${picked === undefined ? "cursor-pointer" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`opt-${shown.id}`}
                          className="mt-1 h-4 w-4 shrink-0 accent-brand-600"
                          checked={picked !== undefined ? isPicked : choice === i}
                          disabled={picked !== undefined}
                          onChange={() => setChoice(i)}
                        />
                        <span className="text-ink">
                          {o.text}
                          {picked !== undefined && !isPicked && best && <span className="ml-2 text-xs font-semibold text-brand-700">Best practice</span>}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {picked === undefined ? (
                <button type="button" disabled={choice === null} onClick={decide} className="mt-5 rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                  Confirm my decision
                </button>
              ) : (
                <>
                  <Outcome o={shown.options[picked]} course={course} task={shown} sim={sim} />
                  {(justDecided === shown.id || viewing) && (
                    <button type="button" onClick={nextItem} className="mt-5 rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">
                      {r.done ? "See my results" : "Next item"} →
                    </button>
                  )}
                </>
              )}
            </article>
          ) : (
            <Report course={course} sim={sim} s={s} r={r} />
          )}
        </div>
      </div>
      {!shown && (
        <div className="hidden print:block">
          <Report course={course} sim={sim} s={s} r={r} />
        </div>
      )}
    </div>
  );
}

function Report({ course, sim, s, r }: { course: ProCourse; sim: Simulation; s: SimState; r: ReturnType<typeof results> }) {
  const pass = r.score >= passMark;
  return (
    <section className="rounded-2xl border border-line bg-white p-6 print:border-0 print:p-0">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Simulation report · {course.title}</p>
      <h2 className="mt-1 text-2xl font-bold text-ink">
        {sim.role}: {r.score}% {pass ? "· Passed" : "· Not yet passed"}
      </h2>
      <p className="mt-2 text-muted">
        {pass
          ? "You handled the week the way a sound officer would. Review any weak calls below, write your hand-over note, then take the final exam."
          : `You need ${passMark}% to pass. Review the outcomes and the modules they point to, then try the week again.`}
      </p>
      <div className="mt-5">
        <Meters sim={sim} values={r.meters} />
      </div>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th className="py-2 pr-3 font-semibold">Item</th>
            <th className="py-2 font-semibold">Your call</th>
          </tr>
        </thead>
        <tbody>
          {r.played.map((t) => {
            const o = t.options[s.picks[t.id]];
            return (
              <tr key={t.id} className="border-b border-line align-top">
                <td className="py-2 pr-3 text-ink">
                  <span className="block text-xs text-muted">{t.when}</span>
                  {t.subject}
                </td>
                <td className="py-2 text-ink">
                  <span className="font-semibold">{grade[o.score]}</span>
                  <span className="block text-muted">{o.text}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-6">
        <label className="block font-semibold text-ink">
          {sim.memo.prompt}
          <ul className="mt-1 list-disc pl-5 text-sm font-normal text-muted">
            {sim.memo.guide.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
          <textarea
            value={s.memo}
            onChange={(e) => write(course.slug, { ...s, memo: e.target.value })}
            rows={8}
            maxLength={4000}
            className="mt-3 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 print:border-black"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 print:hidden">
        <button type="button" onClick={() => window.print()} className="rounded-lg border border-brand-500 px-5 py-2.5 font-semibold text-brand-700 hover:bg-brand-50">
          Download report (PDF)
        </button>
        {pass && (
          <Link href={examHref(course.slug)} className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">
            Go to the final exam →
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Start the week again? Your decisions are cleared; your note is kept.")) write(course.slug, { picks: {}, memo: s.memo });
          }}
          className="rounded-lg px-5 py-2.5 font-semibold text-muted hover:text-red-700"
        >
          Try the week again
        </button>
      </div>
    </section>
  );
}
