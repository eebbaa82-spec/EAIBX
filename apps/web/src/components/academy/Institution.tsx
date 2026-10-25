"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { liveHost } from "@/components/forms";
import { passMark, proCourseHref, verifyUrl } from "@/data/academy/paths";
import { api } from "./seat";

/**
 * The training department's dashboard for an institutional Academy
 * subscription (server side: public/api/academy.php). The department signs in
 * with its institution ID and admin key, adds staff (each gets a personal seat
 * code), assigns courses and due dates, revokes seats, and follows each
 * person's modules, exam, simulation and certificate. Off eruditeafrica.et there
 * is no server, so the page offers a demo with sample staff instead.
 */
export type CatalogCourse = { slug: string; title: string; track: string; modules: string[]; simulation: boolean };
type Seat = {
  code: string;
  name: string;
  staff_id: string;
  email: string;
  department: string;
  branch: string;
  courses: string[];
  due: string;
  status: "active" | "revoked";
  added: string;
};
type CourseRecord = { started: string; done: string[]; exam?: number; sim?: number; certificate?: string; completed?: string; last?: string };
type Data = {
  institution: { id: string; name: string; seats: number; expires: string };
  staff: Seat[];
  progress: Record<string, Record<string, CourseRecord>>;
};
type NewStaff = Pick<Seat, "name" | "staff_id" | "email" | "department" | "branch" | "courses" | "due">;

const SESSION = "investopia-institution-session";
const DEMO = "demo";

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";
const labelClass = "block text-sm font-semibold text-ink";
const buttonClass = "rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60";
const quietButton = "rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink hover:border-brand-500";

const today = () => new Date().toISOString().slice(0, 10);
const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
const pct = (v: number | null | undefined) => (v === null || v === undefined ? "-" : `${v}%`);

/* ------------------------------------------------------------------ figures */

type CourseState = "Not started" | "In progress" | "Completed";

function courseState(r: CourseRecord | undefined): CourseState {
  if (!r) return "Not started";
  return r.certificate ? "Completed" : "In progress";
}

/** The courses a person is expected to finish: those assigned, or with no assignment, those they started. */
function expected(seat: Seat, mine: Record<string, CourseRecord>) {
  return seat.courses.length ? seat.courses : Object.keys(mine);
}

function staffFigures(seat: Seat, mine: Record<string, CourseRecord>) {
  const list = expected(seat, mine);
  const completed = list.filter((c) => mine[c]?.certificate).length;
  const started = Object.keys(mine).length;
  const exams = Object.values(mine).flatMap((r) => (r.exam === undefined ? [] : [r.exam]));
  const sims = Object.values(mine).flatMap((r) => (r.sim === undefined ? [] : [r.sim]));
  const last = Object.values(mine)
    .map((r) => r.last ?? "")
    .sort()
    .pop();
  const overdue = Boolean(seat.due && seat.due < today() && seat.courses.length && completed < seat.courses.length);
  return { list, completed, started, exam: avg(exams), sim: avg(sims), last, overdue };
}

/* ------------------------------------------------------------------ demo */

function demoData(catalog: CatalogCourse[]): Data {
  const pick = (slugs: string[]) => slugs.filter((s) => catalog.some((c) => c.slug === s));
  const credit = pick(["credit-foundations", "credit-analysis-appraisal", "loan-portfolio-management"]);
  const trade = pick(["international-trade-finance", "forex-products-risk-management"]);
  const ops = pick(["domestic-banking-operations", "customer-service-retail-banking"]);
  const people: [string, string, string, string[], string][] = [
    ["Hana Tesfaye", "Credit", "Adama", credit, "2026-12-31"],
    ["Dawit Alemu", "Credit", "Adama", credit, "2026-12-31"],
    ["Meron Bekele", "Credit", "Hawassa", credit, "2026-12-31"],
    ["Yonas Girma", "Credit", "Hawassa", credit, "2026-10-15"],
    ["Selam Haile", "Trade Finance", "Head office", trade, "2026-11-30"],
    ["Abel Mekonnen", "Trade Finance", "Head office", trade, "2026-11-30"],
    ["Liya Assefa", "Trade Finance", "Bahir Dar", trade, "2026-11-30"],
    ["Kidus Tadesse", "Operations", "Bahir Dar", ops, "2026-12-15"],
    ["Rahel Worku", "Operations", "Adama", ops, "2026-12-15"],
    ["Samuel Negash", "Operations", "Hawassa", ops, "2026-10-01"],
    ["Bethlehem Kebede", "Treasury", "Head office", [], ""],
    ["Nahom Desta", "Risk", "Head office", [], ""],
  ];
  // Fixed, varied progress so the demo looks like a real cohort.
  const plan = [
    [5, 88, 83, true],
    [5, 76, 71, true],
    [3, -1, -1, false],
    [1, -1, -1, false],
    [5, 92, 90, true],
    [4, 64, -1, false],
    [2, -1, -1, false],
    [5, 81, 78, true],
    [5, 72, 58, false],
    [0, -1, -1, false],
    [5, 85, 86, true],
    [3, -1, -1, false],
  ] as const;
  const staff: Seat[] = [];
  const progress: Data["progress"] = {};
  people.forEach(([name, department, branch, courses, due], i) => {
    const code = `INS-DEMO${String.fromCharCode(65 + i)}-${String(10000 + i * 7919).slice(-5)}`;
    staff.push({ code, name, staff_id: `BA-${1040 + i * 13}`, email: "", department, branch, courses, due, status: i === 11 ? "revoked" : "active", added: "2026-09-01" });
    const [modules, exam, sim, cert] = plan[i];
    if (!modules) return;
    const mine: Record<string, CourseRecord> = {};
    const list = courses.length ? courses : pick(i === 10 ? ["treasury-forex-management"] : ["risk-management-framework"]);
    list.forEach((slug, k) => {
      const c = catalog.find((x) => x.slug === slug)!;
      const m = Math.max(0, Math.min(c.modules.length, modules - k));
      if (!m && k) return;
      const finished = k === 0 && cert;
      mine[slug] = {
        started: "2026-09-0" + (2 + k),
        done: c.modules.slice(0, m),
        ...(k === 0 && exam >= 0 ? { exam } : {}),
        ...(k === 0 && sim >= 0 ? { sim } : {}),
        ...(finished ? { certificate: `EACOE/DEMO/2026/${code.slice(-5)}ABC`, completed: "2026-10-1" + (i % 9) } : {}),
        last: `2026-10-${String(10 + i).padStart(2, "0")} 10:30`,
      };
    });
    progress[code] = mine;
  });
  return { institution: { id: "DEMO-BANK", name: "Bank A (demo)", seats: 25, expires: "2027-12-31" }, staff, progress };
}

function demoCode(taken: Set<string>) {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  do code = "INS-" + Array.from({ length: 10 }, (_, i) => (i === 5 ? "-" : "") + abc[Math.floor(Math.random() * 32)]).join("");
  while (taken.has(code));
  return code;
}

/* ------------------------------------------------------------------ main */

export function InstitutionDashboard({ catalog }: { catalog: CatalogCourse[] }) {
  const [session, setSession] = useState<string | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const load = useCallback(
    async (s: string) => {
      if (s === DEMO) {
        setData((d) => d ?? demoData(catalog));
        return;
      }
      try {
        const body = await api("overview", { session: s });
        setData({ institution: body.institution as Data["institution"], staff: body.staff as Seat[], progress: body.progress as Data["progress"] });
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load the dashboard");
        if (err instanceof Error && /session/i.test(err.message)) signOut();
      }
    },
    [catalog],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      let s: string | null = null;
      try {
        s = window.sessionStorage.getItem(SESSION);
      } catch {
        // No storage: sign in each visit.
      }
      if (s) {
        setSession(s);
        load(s);
      }
      setReady(true);
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  function signIn(s: string) {
    try {
      window.sessionStorage.setItem(SESSION, s);
    } catch {
      // Kept in memory for this visit.
    }
    setSession(s);
    load(s);
  }

  function signOut() {
    try {
      window.sessionStorage.removeItem(SESSION);
    } catch {
      // Nothing stored.
    }
    setSession(null);
    setData(null);
  }

  /** Runs a change on the server (or on the demo data) and refreshes. */
  async function act(action: "add" | "update", fields: { staff?: NewStaff[]; code?: string; changes?: Partial<Seat> }): Promise<Seat[]> {
    if (session === DEMO) {
      let added: Seat[] = [];
      setData((d) => {
        if (!d) return d;
        if (action === "add") {
          const taken = new Set(d.staff.map((s) => s.code));
          const active = d.staff.filter((s) => s.status === "active").length;
          if (active + fields.staff!.length > d.institution.seats) throw new Error(`Only ${d.institution.seats - active} seats are left on your subscription.`);
          added = fields.staff!.map((n) => {
            const code = demoCode(taken);
            taken.add(code);
            return { ...n, code, status: "active", added: today() } as Seat;
          });
          return { ...d, staff: [...d.staff, ...added] };
        }
        return { ...d, staff: d.staff.map((s) => (s.code === fields.code ? { ...s, ...fields.changes } : s)) };
      });
      return added;
    }
    const body = await api(action, {
      session: session!,
      ...(fields.staff ? { staff: JSON.stringify(fields.staff) } : {}),
      ...(fields.code ? { code: fields.code, changes: JSON.stringify(fields.changes ?? {}) } : {}),
    });
    await load(session!);
    return (body.added as Seat[]) ?? [];
  }

  if (!ready) return <div className="min-h-64" aria-busy="true" />;
  if (!session || !data)
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {error && session && <p role="alert" className="mb-4 text-red-700">{error}</p>}
        <SignIn onSignIn={signIn} />
      </div>
    );
  return <Dashboard data={data} catalog={catalog} demo={session === DEMO} onSignOut={signOut} act={act} />;
}

function SignIn({ onSignIn }: { onSignIn: (session: string) => void }) {
  const [state, setState] = useState<{ busy: boolean; error?: string }>({ busy: false });
  const live = liveHost();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState({ busy: true });
    try {
      const body = await api("login", { institution: String(form.get("institution")), key: String(form.get("key")) });
      onSignIn(String(body.session));
    } catch (err) {
      setState({ busy: false, error: err instanceof Error ? err.message : "Could not sign in" });
    }
  }
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-ink">Sign in for your institution</h2>
        <p className="mt-2 text-muted">Use the institution ID and admin key the Center of Excellence sent your training department when your subscription started.</p>
        {live ? (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className={labelClass}>
              Institution ID
              <input name="institution" required autoComplete="organization" placeholder="BANK-A" className={`${inputClass} uppercase`} />
            </label>
            <label className={labelClass}>
              Admin key
              <input name="key" type="password" required autoComplete="current-password" placeholder="ADM-XXXXX-XXXXX-XXXXX-XXXXX" className={`${inputClass} font-mono`} />
            </label>
            {state.error && (
              <p role="alert" className="text-sm text-red-700">
                {state.error}
              </p>
            )}
            <button type="submit" disabled={state.busy} className={buttonClass}>
              {state.busy ? "Signing in..." : "Sign in"}
            </button>
          </form>
        ) : (
          <p className="mt-6 rounded-lg border border-gold-400 bg-gold-100 p-4 text-sm text-ink">
            This is the preview site, where institutions cannot sign in. Open the demo to see the dashboard with a sample bank and its staff.
          </p>
        )}
        <button type="button" onClick={() => onSignIn(DEMO)} className={`mt-4 ${live ? quietButton : buttonClass}`}>
          Open the demo dashboard
        </button>
      </section>
      <section className="rounded-2xl bg-brand-50 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-brand-900">How institutional subscriptions work</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-ink">
          <li>Your bank or MFI subscribes for a number of staff seats. The Center of Excellence sends the training department an institution ID and an admin key.</li>
          <li>The training department adds staff here, one by one or as a list, and assigns their courses and a completion date. Each person gets a personal seat code.</li>
          <li>Staff open any Academy course, enter their seat code once, and study: modules, quizzes, the officer simulation and the final exam.</li>
          <li>Their progress comes back here: who has started, modules finished, exam and simulation scores, certificates earned, and who is overdue.</li>
          <li>When someone leaves or changes role, revoke the seat and give it to someone else.</li>
        </ol>
        <p className="mt-4 text-sm text-muted">
          To subscribe your institution, write to{" "}
          <a href="mailto:info@kenna.et" className="text-brand-700 underline">
            info@kenna.et
          </a>
          .
        </p>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ dashboard */

function Dashboard({
  data,
  catalog,
  demo,
  onSignOut,
  act,
}: {
  data: Data;
  catalog: CatalogCourse[];
  demo: boolean;
  onSignOut: () => void;
  act: (action: "add" | "update", fields: { staff?: NewStaff[]; code?: string; changes?: Partial<Seat> }) => Promise<Seat[]>;
}) {
  const [tab, setTab] = useState<"overview" | "staff" | "courses" | "add">("overview");
  const [justAdded, setJustAdded] = useState<Seat[]>([]);
  const byCourse = useMemo(() => new Map(catalog.map((c) => [c.slug, c])), [catalog]);
  const active = data.staff.filter((s) => s.status === "active");
  const figures = new Map(data.staff.map((s) => [s.code, staffFigures(s, data.progress[s.code] ?? {})]));

  const tabs: [typeof tab, string][] = [
    ["overview", "Overview"],
    ["staff", `Staff (${data.staff.length})`],
    ["courses", "Courses"],
    ["add", "Give access"],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {demo && (
        <p className="mb-6 rounded-lg border border-gold-400 bg-gold-100 p-4 text-sm text-ink">
          <strong>Demo:</strong> a sample bank with made-up staff. Changes you make here are not saved.
        </p>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">{data.institution.id}</p>
          <h2 className="text-2xl font-bold text-ink">{data.institution.name}</h2>
          <p className="text-muted">
            {active.length} of {data.institution.seats} seats in use{data.institution.expires && ` · subscription until ${data.institution.expires}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => downloadCsv(data, byCourse)} className={quietButton}>
            Download report (CSV)
          </button>
          <button type="button" onClick={onSignOut} className={quietButton}>
            Sign out
          </button>
        </div>
      </div>

      <div role="tablist" className="mt-6 flex flex-wrap gap-2 border-b border-line">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`-mb-px rounded-t-lg border-b-2 px-4 py-2 font-semibold ${tab === id ? "border-brand-600 text-brand-700" : "border-transparent text-muted hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && <Overview data={data} figures={figures} byCourse={byCourse} onTab={setTab} />}
        {tab === "staff" && <StaffTable data={data} figures={figures} byCourse={byCourse} catalog={catalog} act={act} />}
        {tab === "courses" && <CourseTable data={data} catalog={catalog} />}
        {tab === "add" && (
          <AddStaff
            catalog={catalog}
            free={data.institution.seats - active.length}
            institution={data.institution.name}
            byCourse={byCourse}
            justAdded={justAdded}
            onAdd={async (rows) => {
              const added = await act("add", { staff: rows });
              setJustAdded(added);
            }}
          />
        )}
      </div>
    </div>
  );
}

function Tile({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
      <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

type Figures = ReturnType<typeof staffFigures>;

function Overview({
  data,
  figures,
  byCourse,
  onTab,
}: {
  data: Data;
  figures: Map<string, Figures>;
  byCourse: Map<string, CatalogCourse>;
  onTab: (t: "staff" | "add") => void;
}) {
  const active = data.staff.filter((s) => s.status === "active");
  const f = active.map((s) => figures.get(s.code)!);
  const started = f.filter((x) => x.started > 0).length;
  const expectedTotal = f.reduce((a, x) => a + x.list.length, 0);
  const completedTotal = f.reduce((a, x) => a + x.completed, 0);
  const certificates = Object.values(data.progress).reduce((a, mine) => a + Object.values(mine).filter((r) => r.certificate).length, 0);
  const exams = Object.values(data.progress).flatMap((mine) => Object.values(mine).flatMap((r) => (r.exam === undefined ? [] : [r.exam])));
  const sims = Object.values(data.progress).flatMap((mine) => Object.values(mine).flatMap((r) => (r.sim === undefined ? [] : [r.sim])));
  const overdue = active.filter((s) => figures.get(s.code)!.overdue);
  const notStarted = active.filter((s) => figures.get(s.code)!.started === 0);
  const groups = Array.from(new Set(active.map((s) => s.department || "Not set"))).sort();
  const completionRate = expectedTotal ? Math.round((completedTotal / expectedTotal) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Tile label="Staff enrolled" value={active.length} note={`${data.institution.seats - active.length} seats free`} />
        <Tile label="Started learning" value={`${started} of ${active.length}`} />
        <Tile label="Course completion" value={`${completionRate}%`} note={`${completedTotal} of ${expectedTotal} expected courses`} />
        <Tile label="Certificates earned" value={certificates} />
        <Tile label="Average exam score" value={pct(avg(exams))} note={`Pass mark ${passMark}%`} />
        <Tile label="Average simulation score" value={pct(avg(sims))} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-6">
          <h3 className="text-lg font-bold text-ink">Completion by department</h3>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-muted">
              <tr>
                <th className="pb-2 font-semibold">Department</th>
                <th className="pb-2 font-semibold">Staff</th>
                <th className="w-1/3 pb-2 font-semibold">Completion</th>
                <th className="pb-2 pl-4 font-semibold">Avg exam</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => {
                const people = active.filter((s) => (s.department || "Not set") === g);
                const fx = people.map((s) => figures.get(s.code)!);
                const exp = fx.reduce((a, x) => a + x.list.length, 0);
                const done = fx.reduce((a, x) => a + x.completed, 0);
                const rate = exp ? Math.round((done / exp) * 100) : 0;
                return (
                  <tr key={g} className="border-t border-line">
                    <td className="py-2 font-semibold text-ink">{g}</td>
                    <td className="py-2">{people.length}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <Bar value={rate} />
                        <span className="w-10 text-right">{rate}%</span>
                      </div>
                    </td>
                    <td className="py-2 pl-4">{pct(avg(fx.flatMap((x) => (x.exam === null ? [] : [x.exam]))))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6">
          <h3 className="text-lg font-bold text-ink">Needs attention</h3>
          {!overdue.length && !notStarted.length ? (
            <p className="mt-3 text-muted">Everyone with an assignment has started, and nobody is past their due date.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {overdue.map((s) => {
                const x = figures.get(s.code)!;
                return (
                  <li key={s.code} className="rounded-lg bg-red-50 px-3 py-2 text-red-900">
                    <strong>{s.name}</strong> ({s.department || "no department"}, {s.branch || "no branch"}) is past the due date of {s.due}: {x.completed} of{" "}
                    {x.list.length} courses completed.
                  </li>
                );
              })}
              {notStarted.map((s) => (
                <li key={s.code} className="rounded-lg bg-gold-100 px-3 py-2 text-ink">
                  <strong>{s.name}</strong> has not started yet
                  {s.courses.length ? `: ${s.courses.map((c) => byCourse.get(c)?.title ?? c).join(", ")}` : ""}.
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => onTab("staff")} className={quietButton}>
              See all staff
            </button>
            <button type="button" onClick={() => onTab("add")} className={quietButton}>
              Give access to more staff
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusPill({ state }: { state: CourseState | "Revoked" | "Overdue" }) {
  const style =
    state === "Completed"
      ? "bg-brand-50 text-brand-700"
      : state === "In progress"
        ? "bg-gold-100 text-ink"
        : state === "Overdue"
          ? "bg-red-50 text-red-800"
          : state === "Revoked"
            ? "bg-line text-muted"
            : "bg-white text-muted border border-line";
  return <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${style}`}>{state}</span>;
}

function StaffTable({
  data,
  figures,
  byCourse,
  catalog,
  act,
}: {
  data: Data;
  figures: Map<string, Figures>;
  byCourse: Map<string, CatalogCourse>;
  catalog: CatalogCourse[];
  act: (action: "update", fields: { code: string; changes: Partial<Seat> }) => Promise<Seat[]>;
}) {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [branch, setBranch] = useState("");
  const [show, setShow] = useState<"all" | "active" | "overdue" | "revoked">("active");
  const [open, setOpen] = useState<string | null>(null);
  const departments = Array.from(new Set(data.staff.map((s) => s.department).filter(Boolean))).sort();
  const branches = Array.from(new Set(data.staff.map((s) => s.branch).filter(Boolean))).sort();
  const q = query.trim().toLowerCase();
  // The person being managed stays in view even if a change (say, revoking) takes them out of the filter.
  const rows = data.staff.filter(
    (s) =>
      s.code === open ||
      (!q || [s.name, s.staff_id, s.email, s.code].some((v) => v.toLowerCase().includes(q))) &&
      (!department || s.department === department) &&
      (!branch || s.branch === branch) &&
      (show === "all" ||
        (show === "revoked" ? s.status === "revoked" : s.status === "active" && (show === "active" || figures.get(s.code)!.overdue))),
  );

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <label className={`${labelClass} min-w-56 flex-1`}>
          Search
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, staff ID, email or code" className={inputClass} />
        </label>
        <label className={labelClass}>
          Department
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass}>
            <option value="">All</option>
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Branch
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className={inputClass}>
            <option value="">All</option>
            {branches.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Show
          <select value={show} onChange={(e) => setShow(e.target.value as typeof show)} className={inputClass}>
            <option value="active">Active seats</option>
            <option value="overdue">Overdue only</option>
            <option value="revoked">Revoked seats</option>
            <option value="all">Everyone</option>
          </select>
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[56rem] text-sm">
          <thead className="bg-brand-50 text-left text-brand-900">
            <tr>
              <th className="px-4 py-3 font-semibold">Staff</th>
              <th className="px-4 py-3 font-semibold">Department, branch</th>
              <th className="px-4 py-3 font-semibold">Courses</th>
              <th className="w-40 px-4 py-3 font-semibold">Completion</th>
              <th className="px-4 py-3 font-semibold">Avg exam</th>
              <th className="px-4 py-3 font-semibold">Simulation</th>
              <th className="px-4 py-3 font-semibold">Due</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const x = figures.get(s.code)!;
              const rate = x.list.length ? Math.round((x.completed / x.list.length) * 100) : 0;
              return (
                <Fragment key={s.code}>
                  <tr className="border-t border-line align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{s.name}</p>
                      <p className="text-xs text-muted">
                        {s.staff_id || "No staff ID"} · <span className="font-mono">{s.code}</span>
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {s.department || "-"}
                      <br />
                      <span className="text-muted">{s.branch || "-"}</span>
                    </td>
                    <td className="px-4 py-3">{s.courses.length ? `${s.courses.length} assigned` : <span className="text-muted">Any course</span>}</td>
                    <td className="px-4 py-3">
                      <p className="mb-1">
                        {x.completed} of {x.list.length || 0} completed
                      </p>
                      <Bar value={rate} />
                    </td>
                    <td className="px-4 py-3">{pct(x.exam)}</td>
                    <td className="px-4 py-3">{pct(x.sim)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{s.due || "-"}</td>
                    <td className="px-4 py-3">
                      <StatusPill state={s.status === "revoked" ? "Revoked" : x.overdue ? "Overdue" : x.started ? (x.list.length && x.completed === x.list.length ? "Completed" : "In progress") : "Not started"} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => setOpen(open === s.code ? null : s.code)} className={quietButton} aria-expanded={open === s.code}>
                        {open === s.code ? "Close" : "Manage"}
                      </button>
                    </td>
                  </tr>
                  {open === s.code && (
                    <tr className="border-t border-line bg-canvas">
                      <td colSpan={9} className="px-4 py-5">
                        <StaffDetail seat={s} mine={data.progress[s.code] ?? {}} byCourse={byCourse} catalog={catalog} institution={data.institution.name} act={act} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted">
                  No staff match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StaffDetail({
  seat,
  mine,
  byCourse,
  catalog,
  institution,
  act,
}: {
  seat: Seat;
  mine: Record<string, CourseRecord>;
  byCourse: Map<string, CatalogCourse>;
  catalog: CatalogCourse[];
  institution: string;
  act: (action: "update", fields: { code: string; changes: Partial<Seat> }) => Promise<Seat[]>;
}) {
  const [courses, setCourses] = useState(seat.courses);
  const [due, setDue] = useState(seat.due);
  const [state, setState] = useState<{ busy: boolean; error?: string; saved?: boolean }>({ busy: false });
  const list = Array.from(new Set([...seat.courses, ...Object.keys(mine)]));

  async function save(changes: Partial<Seat>) {
    setState({ busy: true });
    try {
      await act("update", { code: seat.code, changes });
      setState({ busy: false, saved: true });
    } catch (err) {
      setState({ busy: false, error: err instanceof Error ? err.message : "Not saved" });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-bold text-ink">Course progress</h4>
        {list.length ? (
          <table className="mt-2 w-full text-sm">
            <thead className="text-left text-muted">
              <tr>
                <th className="py-1 font-semibold">Course</th>
                <th className="py-1 font-semibold">Modules</th>
                <th className="py-1 font-semibold">Final exam</th>
                <th className="py-1 font-semibold">Simulation</th>
                <th className="py-1 font-semibold">Certificate</th>
                <th className="py-1 font-semibold">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {list.map((slug) => {
                const c = byCourse.get(slug);
                const r = mine[slug];
                return (
                  <tr key={slug} className="border-t border-line">
                    <td className="py-2 pr-3">
                      <span className="font-semibold text-ink">{c?.title ?? slug}</span>{" "}
                      {!seat.courses.includes(slug) && seat.courses.length > 0 && <span className="text-xs text-muted">(not assigned)</span>}
                      <br />
                      <StatusPill state={courseState(r)} />
                    </td>
                    <td className="py-2">
                      {r?.done.length ?? 0} of {c?.modules.length ?? 5}
                    </td>
                    <td className="py-2">{r?.exam === undefined ? "Not taken" : `${r.exam}%${r.exam >= passMark ? "" : " (not passed)"}`}</td>
                    <td className="py-2">{c && !c.simulation ? "None" : r?.sim === undefined ? "Not finished" : `${r.sim}%`}</td>
                    <td className="py-2">
                      {r?.certificate ? (
                        <a href={verifyUrl(r.certificate)} className="font-mono text-xs text-brand-700 underline" target="_blank" rel="noreferrer">
                          {r.certificate}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-2">{r?.last ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="mt-2 text-muted">No courses assigned or started yet.</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          <h4 className="font-bold text-ink">Assigned courses</h4>
          <CoursePicker catalog={catalog} value={courses} onChange={setCourses} />
        </div>
        <div className="space-y-4">
          <label className={labelClass}>
            Complete by
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputClass} />
          </label>
          <button type="button" disabled={state.busy} onClick={() => save({ courses, due })} className={buttonClass}>
            Save assignment
          </button>
          <div className="flex flex-wrap gap-2">
            <a href={inviteMail(seat, institution, byCourse)} className={quietButton}>
              Email the seat code
            </a>
            {seat.status === "active" ? (
              <button type="button" disabled={state.busy} onClick={() => save({ status: "revoked" })} className={`${quietButton} text-red-700`}>
                Revoke seat
              </button>
            ) : (
              <button type="button" disabled={state.busy} onClick={() => save({ status: "active" })} className={quietButton}>
                Reactivate seat
              </button>
            )}
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-red-700">
              {state.error}
            </p>
          )}
          {state.saved && (
            <p role="status" className="text-sm text-brand-700">
              Saved.
            </p>
          )}
          <p className="text-xs text-muted">Revoking stops the code within a day on every device. Progress already made stays in your reports.</p>
        </div>
      </div>
    </div>
  );
}

function CoursePicker({ catalog, value, onChange }: { catalog: CatalogCourse[]; value: string[]; onChange: (v: string[]) => void }) {
  const groups = Array.from(new Set(catalog.map((c) => c.track)));
  const toggle = (slug: string) => onChange(value.includes(slug) ? value.filter((s) => s !== slug) : [...value, slug]);
  return (
    <div className="mt-2 rounded-xl border border-line bg-white p-4">
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" checked={!value.length} onChange={() => onChange([])} className="h-4 w-4 accent-brand-600" />
        Any course (no assignment; every course stays open)
      </label>
      <div className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-2">
        {groups.map((g) => (
          <fieldset key={g}>
            <legend className="text-xs font-semibold uppercase tracking-wide text-muted">{g}</legend>
            <div className="mt-1 grid gap-1 sm:grid-cols-2">
              {catalog
                .filter((c) => c.track === g)
                .map((c) => (
                  <label key={c.slug} className="flex items-start gap-2 text-sm text-ink">
                    <input type="checkbox" checked={value.includes(c.slug)} onChange={() => toggle(c.slug)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600" />
                    {c.title}
                  </label>
                ))}
            </div>
          </fieldset>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">{value.length ? `${value.length} assigned. Staff can open only these courses.` : "No assignment."}</p>
    </div>
  );
}

function CourseTable({ data, catalog }: { data: Data; catalog: CatalogCourse[] }) {
  const active = data.staff.filter((s) => s.status === "active");
  const rows = catalog
    .map((c) => {
      const assigned = active.filter((s) => s.courses.includes(c.slug)).length;
      const records = active.map((s) => data.progress[s.code]?.[c.slug]).filter((r): r is CourseRecord => Boolean(r));
      const completed = records.filter((r) => r.certificate).length;
      return {
        c,
        assigned,
        started: records.length,
        completed,
        exam: avg(records.flatMap((r) => (r.exam === undefined ? [] : [r.exam]))),
        sim: avg(records.flatMap((r) => (r.sim === undefined ? [] : [r.sim]))),
      };
    })
    .filter((r) => r.assigned || r.started);
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[48rem] text-sm">
        <thead className="bg-brand-50 text-left text-brand-900">
          <tr>
            <th className="px-4 py-3 font-semibold">Course</th>
            <th className="px-4 py-3 font-semibold">Assigned</th>
            <th className="px-4 py-3 font-semibold">Started</th>
            <th className="w-48 px-4 py-3 font-semibold">Completed</th>
            <th className="px-4 py-3 font-semibold">Avg exam</th>
            <th className="px-4 py-3 font-semibold">Avg simulation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ c, assigned, started, completed, exam, sim }) => {
            const base = Math.max(assigned, started);
            const rate = base ? Math.round((completed / base) * 100) : 0;
            return (
              <tr key={c.slug} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={proCourseHref(c.slug)} className="font-semibold text-brand-700 underline">
                    {c.title}
                  </Link>
                  <p className="text-xs text-muted">{c.track}</p>
                </td>
                <td className="px-4 py-3">{assigned}</td>
                <td className="px-4 py-3">{started}</td>
                <td className="px-4 py-3">
                  <p className="mb-1">
                    {completed} ({rate}%)
                  </p>
                  <Bar value={rate} />
                </td>
                <td className="px-4 py-3">{pct(exam)}</td>
                <td className="px-4 py-3">{c.simulation ? pct(sim) : "None"}</td>
              </tr>
            );
          })}
          {!rows.length && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted">
                No courses assigned or started yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ give access */

function parseList(text: string): NewStaff[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.split(/\t|,/).map((v) => v.trim()))
    .filter((cells) => cells[0] && !/^name$/i.test(cells[0]))
    .map(([name, staff_id = "", email = "", department = "", branch = ""]) => ({ name, staff_id, email, department, branch, courses: [], due: "" }));
}

function AddStaff({
  catalog,
  free,
  institution,
  byCourse,
  justAdded,
  onAdd,
}: {
  catalog: CatalogCourse[];
  free: number;
  institution: string;
  byCourse: Map<string, CatalogCourse>;
  justAdded: Seat[];
  onAdd: (rows: NewStaff[]) => Promise<void>;
}) {
  const [mode, setMode] = useState<"one" | "list">("one");
  const [courses, setCourses] = useState<string[]>([]);
  const [due, setDue] = useState("");
  const [list, setList] = useState("");
  const [state, setState] = useState<{ busy: boolean; error?: string }>({ busy: false });
  const parsed = mode === "list" ? parseList(list) : [];

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const rows =
      mode === "one"
        ? [
            {
              name: String(form.get("name")).trim(),
              staff_id: String(form.get("staff_id")).trim(),
              email: String(form.get("email")).trim(),
              department: String(form.get("department")).trim(),
              branch: String(form.get("branch")).trim(),
              courses,
              due,
            },
          ]
        : parsed.map((r) => ({ ...r, courses, due }));
    if (!rows.length || !rows[0].name) return;
    setState({ busy: true });
    try {
      await onAdd(rows);
      setState({ busy: false });
      e.currentTarget?.reset();
      setList("");
    } catch (err) {
      setState({ busy: false, error: err instanceof Error ? err.message : "Not added" });
    }
  }

  return (
    <div className="space-y-8">
      {justAdded.length > 0 && <NewCodes seats={justAdded} institution={institution} byCourse={byCourse} />}
      <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-ink">Give staff access</h3>
          <p className="text-sm text-muted">{free} seats free</p>
        </div>
        <div className="mt-4 flex gap-2" role="radiogroup" aria-label="How to add">
          {(
            [
              ["one", "One person"],
              ["list", "A list of staff"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" role="radio" aria-checked={mode === id} onClick={() => setMode(id)} className={mode === id ? buttonClass : quietButton}>
              {label}
            </button>
          ))}
        </div>

        {mode === "one" ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className={labelClass}>
              Full name
              <input name="name" required maxLength={120} className={inputClass} />
            </label>
            <label className={labelClass}>
              Staff ID
              <input name="staff_id" maxLength={40} className={inputClass} />
            </label>
            <label className={labelClass}>
              Work email
              <input name="email" type="email" maxLength={160} className={inputClass} />
            </label>
            <label className={labelClass}>
              Department
              <input name="department" maxLength={120} placeholder="Credit" className={inputClass} />
            </label>
            <label className={labelClass}>
              Branch or unit
              <input name="branch" maxLength={120} placeholder="Adama branch" className={inputClass} />
            </label>
          </div>
        ) : (
          <div className="mt-5">
            <label className={labelClass}>
              Paste one person per line: name, staff ID, email, department, branch
              <textarea
                value={list}
                onChange={(e) => setList(e.target.value)}
                rows={6}
                placeholder={"Hana Tesfaye, BA-1040, hana@bank.et, Credit, Adama\nDawit Alemu, BA-1053, dawit@bank.et, Credit, Hawassa"}
                className={`${inputClass} font-mono text-sm`}
              />
            </label>
            <p className="mt-1 text-sm text-muted">Copy the columns straight from a spreadsheet. {parsed.length ? `${parsed.length} people found.` : ""}</p>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div>
            <p className={labelClass}>Assign courses</p>
            <CoursePicker catalog={catalog} value={courses} onChange={setCourses} />
          </div>
          <div className="space-y-4">
            <label className={labelClass}>
              Complete by (optional)
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputClass} />
            </label>
            {state.error && (
              <p role="alert" className="text-sm text-red-700">
                {state.error}
              </p>
            )}
            <button type="submit" disabled={state.busy || (mode === "list" && !parsed.length)} className={buttonClass}>
              {state.busy ? "Adding..." : mode === "one" ? "Create seat code" : `Create ${parsed.length || ""} seat codes`}
            </button>
            <p className="text-sm text-muted">
              Each person gets a personal seat code. Send it to them by email; they enter it once on any Academy course page under &ldquo;Already
              subscribed?&rdquo;.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function NewCodes({ seats, institution, byCourse }: { seats: Seat[]; institution: string; byCourse: Map<string, CatalogCourse> }) {
  function download() {
    const rows = [["Name", "Staff ID", "Email", "Department", "Branch", "Seat code", "Courses", "Complete by"]].concat(
      seats.map((s) => [s.name, s.staff_id, s.email, s.department, s.branch, s.code, s.courses.map((c) => byCourse.get(c)?.title ?? c).join("; ") || "Any course", s.due]),
    );
    save(rows, "CoE-seat-codes.csv");
  }
  return (
    <section role="status" className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
      <h3 className="text-lg font-bold text-brand-900">
        {seats.length} new seat code{seats.length === 1 ? "" : "s"}
      </h3>
      <p className="mt-1 text-ink">Send each person their code. You can find the codes again under Staff at any time.</p>
      <ul className="mt-4 divide-y divide-brand-200">
        {seats.map((s) => (
          <li key={s.code} className="flex flex-wrap items-center justify-between gap-3 py-2">
            <span>
              <strong>{s.name}</strong> <span className="font-mono">{s.code}</span>
            </span>
            <a href={inviteMail(s, institution, byCourse)} className={quietButton}>
              Email the code
            </a>
          </li>
        ))}
      </ul>
      <button type="button" onClick={download} className={`mt-4 ${buttonClass}`}>
        Download the codes (CSV)
      </button>
    </section>
  );
}

/* ------------------------------------------------------------------ files and email */

function inviteMail(seat: Seat, institution: string, byCourse: Map<string, CatalogCourse>) {
  const courses = seat.courses.length ? seat.courses.map((c) => `- ${byCourse.get(c)?.title ?? c}`).join("\n") : "- Any Academy course you choose";
  const body = [
    `Dear ${seat.name},`,
    "",
    `${institution} has given you a seat in the Erudite Africa Center of Excellence.`,
    "",
    `Your personal seat code: ${seat.code}`,
    "",
    "1. Go to https://eruditeafrica.et/academy/courses/ and open one of your courses.",
    "2. Register once, then enter the seat code under \"Already subscribed?\".",
    "3. Work through the modules, the officer simulation and the final exam to earn your certificate.",
    "",
    "Your courses:",
    courses,
    seat.due ? `\nPlease complete them by ${seat.due}.` : "",
    "",
    "Keep the code to yourself; your progress is reported to the training department.",
  ].join("\n");
  return `mailto:${encodeURIComponent(seat.email)}?subject=${encodeURIComponent("Your Center of Excellence seat")}&body=${encodeURIComponent(body)}`;
}

function save(rows: string[][], file: string) {
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = file;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadCsv(data: Data, byCourse: Map<string, CatalogCourse>) {
  const rows = [
    [
      "Name",
      "Staff ID",
      "Email",
      "Department",
      "Branch",
      "Seat code",
      "Seat status",
      "Course",
      "Assigned",
      "Status",
      "Modules done",
      "Modules total",
      "Final exam %",
      "Simulation %",
      "Certificate",
      "Completed",
      "Last activity",
      "Complete by",
    ],
  ];
  for (const s of data.staff) {
    const mine = data.progress[s.code] ?? {};
    const list = Array.from(new Set([...s.courses, ...Object.keys(mine)]));
    if (!list.length) list.push("");
    for (const slug of list) {
      const c = byCourse.get(slug);
      const r = mine[slug];
      rows.push([
        s.name,
        s.staff_id,
        s.email,
        s.department,
        s.branch,
        s.code,
        s.status,
        slug ? (c?.title ?? slug) : "",
        slug ? (s.courses.includes(slug) ? "Yes" : "No") : "",
        slug ? courseState(r) : "",
        slug ? String(r?.done.length ?? 0) : "",
        slug ? String(c?.modules.length ?? "") : "",
        r?.exam === undefined ? "" : String(r.exam),
        r?.sim === undefined ? "" : String(r.sim),
        r?.certificate ?? "",
        r?.completed ?? "",
        r?.last ?? "",
        s.due,
      ]);
    }
  }
  save(rows, `CoE-${data.institution.id}-${today()}.csv`);
}

