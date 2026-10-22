import { liveHost } from "@/components/forms";

/**
 * Institutional seats (see public/api/academy.php). A bank's training
 * department gives each member of staff a seat code (INS-XXXXX-XXXXX). The code
 * unlocks the Academy, may limit it to assigned courses, and lets this browser
 * report progress to the department's dashboard. Individual access codes
 * (INV-...) report nothing.
 */
export const ACADEMY_API = "/api/academy.php";
export const SEAT_KEY = "investopia-academy-seat";
const CODE_KEY = "investopia-academy-code";
const PROGRESS_KEY = "investopia-academy-progress";

export type Seat = { institution: string; name: string; courses: string[]; due: string };
type ServerCourse = { done?: string[]; exam?: number; sim?: number; certificate?: string };

export const isSeatCode = (code: string) => /^INS-[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(code);

export function seatInfo(): Seat | null {
  try {
    const v = JSON.parse(window.localStorage.getItem(SEAT_KEY) ?? "null");
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}

/** Whether this browser's seat may open a course; individual subscribers may open all. */
export function seatAllows(course: string) {
  const seat = seatInfo();
  return !seat || !seat.courses.length || seat.courses.includes(course);
}

export async function api(action: string, fields: Record<string, string>) {
  const data = new FormData();
  data.set("action", action);
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  const res = await fetch(ACADEMY_API, { method: "POST", body: data });
  const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; [key: string]: unknown } | null;
  if (!res.ok || !body?.ok) throw new Error(body?.error ?? "Please try again");
  return body;
}

/** Checks a seat code with Investopia, remembers the seat and brings back progress saved on other devices. */
export async function claimSeat(code: string) {
  const body = await api("seat", { code });
  const seat: Seat = { institution: String(body.institution), name: String(body.name), courses: (body.courses as string[]) ?? [], due: String(body.due ?? "") };
  try {
    window.localStorage.setItem(SEAT_KEY, JSON.stringify(seat));
    const saved = (body.progress ?? {}) as Record<string, ServerCourse>;
    const local = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "{}") as Record<string, { done: string[]; exam?: { score: number; total: number; date: string } }>;
    for (const [course, c] of Object.entries(saved)) {
      const mine = local[course] ?? { done: [] };
      mine.done = Array.from(new Set([...(mine.done ?? []), ...(c.done ?? [])]));
      local[course] = mine;
    }
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(local));
  } catch {
    // Storage unavailable: the seat lasts for this visit.
  }
  return seat;
}

/** Sends this course's progress to the training department's dashboard, when the learner holds a seat. */
export function reportProgress(course: string, sim?: { score: number; done: boolean }) {
  if (!liveHost()) return;
  let code = "";
  let entry: { done?: string[]; exam?: { score: number; total: number } } = {};
  try {
    code = window.localStorage.getItem(CODE_KEY) ?? "";
    entry = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "{}")[course] ?? {};
  } catch {
    return;
  }
  if (!isSeatCode(code)) return;
  const fields: Record<string, string> = { code, course, done: (entry.done ?? []).join(",") };
  if (entry.exam) {
    fields.exam_score = String(entry.exam.score);
    fields.exam_total = String(entry.exam.total);
  }
  if (sim) {
    fields.sim_score = String(sim.score);
    fields.sim_done = sim.done ? "1" : "0";
  }
  api("report", fields).catch(() => {
    // Not reported this time; the next step in the course reports everything again.
  });
}

/**
 * Re-checks a seat with Investopia at most once a day, so a seat the training
 * department revokes stops working. Returns false only when the seat is gone.
 */
let checking: Promise<boolean> | null = null;
export function seatStillValid() {
  checking ??= checkSeat();
  return checking;
}

async function checkSeat() {
  if (!liveHost()) return true;
  let code = "";
  let last = 0;
  try {
    code = window.localStorage.getItem(CODE_KEY) ?? "";
    last = Number(window.localStorage.getItem(SEAT_KEY + "-checked") ?? 0);
  } catch {
    return true;
  }
  if (!isSeatCode(code) || Date.now() - last < 86_400_000) return true;
  try {
    await claimSeat(code);
    window.localStorage.setItem(SEAT_KEY + "-checked", String(Date.now()));
    return true;
  } catch (err) {
    // Only a refused code ends the seat; being offline does not.
    return !(err instanceof Error && /not valid/.test(err.message));
  }
}

/** Forgets a seat, for when an individual access code is entered instead. */
export function forgetSeat() {
  try {
    window.localStorage.removeItem(SEAT_KEY);
    window.localStorage.removeItem(SEAT_KEY + "-checked");
  } catch {
    // Nothing stored.
  }
}
