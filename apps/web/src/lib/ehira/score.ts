import {
  addedFlags,
  dimensions,
  gradeBands,
  questions,
  RATIO_WEIGHT,
  ratioBands,
  screening,
  typeWeights,
  type Answers,
  type Band,
  type BusinessType,
  type DimensionId,
  type Grade,
  type Question,
} from "./model";

/** First band whose threshold the value meets. Bands are listed from the highest threshold down. */
export function bandScore(value: number, bands: Band[]) {
  for (const b of bands) if (b.strict ? value > b.min : value >= b.min) return b.score;
  return bands[bands.length - 1].score;
}

export const isVisible = (q: Question, a: Answers, type: BusinessType) => (!q.for || q.for.includes(type)) && (!q.showIf || q.showIf(a));

/** Local date as YYYY-MM-DD, to compare with date inputs. */
export const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Tax clearance (G3): valid while today is on or before the expiry date given. */
export function taxClearance(a: Answers, today = new Date()): "valid" | "expired" | "missing" {
  const expiry = a.G3_EXPIRY;
  if (typeof expiry !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(expiry)) {
    // The quick self-check asks a plain yes/no instead of the certificate details.
    if (a.QG3 === "yes") return "valid";
    if (a.QG3 === "no") return "expired";
    return "missing";
  }
  return expiry >= isoDate(today) ? "valid" : "expired";
}

/** Several options picked: the best one counts in full, and each further option adds 10 points, up to 100. */
export function multiScore(q: Question, v: string): number | null {
  const scores = v
    .split(",")
    .map((x) => q.options?.find((o) => o.value === x)?.score)
    .filter((x): x is number => typeof x === "number")
    .sort((x, y) => y - x);
  if (!scores.length) return null;
  return Math.min(100, scores[0] + 10 * scores.filter((x) => x > 0).slice(1).length);
}

/** Response score from 0 to 100, or null when the question is unscored or unanswered. */
export function responseScore(q: Question, a: Answers): number | null {
  if (q.type === "taxclearance") {
    const t = taxClearance(a);
    return t === "missing" ? null : t === "valid" ? 100 : 0;
  }
  const v = a[q.id];
  if (q.unscored || v === undefined || v === "na") return null;
  if (q.type === "yesno") return v === "yes" ? 100 : 0;
  if (q.type === "choice" && q.multi) return multiScore(q, String(v));
  if (q.type === "choice") return q.options?.find((o) => o.value === v)?.score ?? null;
  if (typeof v !== "number") return null;
  if (q.type === "scale") return ((Math.min(5, Math.max(1, v)) - 1) / 4) * 100;
  if (q.bands) return bandScore(v, q.bands);
  return null;
}

const num = (v: Answers[string]) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

export type Ratio = { id: string; name: string; formula: string; value: number | null; display: string; score: number | null; note?: string };

export function ratios(a: Answers): Ratio[] {
  const revenue = num(a.F3), profit = num(a.F4);
  const ca = num(a.FR1), cl = num(a.FR2), debt = num(a.FR3), equity = num(a.FR4), noi = num(a.FR5), ds = num(a.FR6);
  const out: Ratio[] = [];

  const cr = ca !== undefined && cl !== undefined && cl > 0 ? ca / cl : null;
  out.push({ id: "current", name: "Current ratio", formula: "Current assets ÷ current liabilities", value: cr, display: cr === null ? "Not provided" : cr.toFixed(2), score: cr === null ? null : bandScore(cr, ratioBands.currentRatio) });

  let de: number | null = null, deScore: number | null = null, deNote: string | undefined;
  if (debt !== undefined && equity !== undefined) {
    if (equity <= 0) {
      deScore = 0;
      deNote = "Equity is zero or negative.";
    } else {
      de = debt / equity;
      deScore = bandScore(de, ratioBands.debtToEquity);
    }
  }
  out.push({ id: "leverage", name: "Debt-to-equity", formula: "Total debt ÷ total equity", value: de, display: deNote ? "Negative equity" : de === null ? "Not provided" : de.toFixed(2), score: deScore, note: deNote });

  const pm = revenue !== undefined && revenue > 0 && profit !== undefined ? (profit / revenue) * 100 : null;
  out.push({ id: "margin", name: "Net profit margin", formula: "Net profit ÷ revenue", value: pm, display: pm === null ? "Not provided" : `${pm.toFixed(1)}%`, score: pm === null ? null : bandScore(pm, ratioBands.profitMargin) });

  let dscr: number | null = null, dscrScore: number | null = null, dscrNote: string | undefined;
  if (noi !== undefined && ds !== undefined) {
    if (ds === 0) dscrNote = "No debt service, so not applicable.";
    else {
      dscr = noi / ds;
      dscrScore = bandScore(dscr, ratioBands.dscr);
    }
  }
  out.push({ id: "dscr", name: "Debt service coverage (DSCR)", formula: "Net operating income ÷ total debt service", value: dscr, display: dscrNote ? "Not applicable" : dscr === null ? "Not provided" : dscr.toFixed(2), score: dscrScore, note: dscrNote });
  return out;
}

/**
 * Whether a loan more than 90 days overdue was reported: from the attached NBE report in the full assessment,
 * or the quick self-check's yes/no (QF8). A signed declaration means none.
 */
export function nonPerforming(a: Answers): boolean | null {
  if (a.F8_ROUTE === "declaration") return a.F8_AGREE === "yes" ? false : null;
  if (a.F8_ROUTE === "report") return a.F8 === "yes" ? true : a.F8 === "no" ? false : null;
  return a.QF8 === "yes" ? true : a.QF8 === "no" ? false : null;
}

export type RedFlag = { flag: string; cap: Grade };

export function redFlags(a: Answers, r: Ratio[]): RedFlag[] {
  const flags: RedFlag[] = [];
  if (a.F1 === "no") flags.push({ flag: "No annual financial statements", cap: "C" });
  if (taxClearance(a) === "expired") flags.push({ flag: "Tax clearance certificate expired", cap: "C" });
  const equity = num(a.FR4);
  if (equity !== undefined && equity < 0) flags.push({ flag: "Negative equity", cap: "D" });
  const dscr = r.find((x) => x.id === "dscr");
  if (dscr?.value !== null && dscr?.value !== undefined && dscr.value < 1) flags.push({ flag: "DSCR below 1.0", cap: "D" });
  for (const s of screening) if (a[s.id] === s.flagIf) flags.push({ flag: s.flag, cap: s.cap });
  for (const f of addedFlags) if (nonPerforming(a) === (f.is === "yes")) flags.push({ flag: f.flag, cap: f.cap });
  return flags;
}

const order: Grade[] = ["A", "B", "C", "D", "E"];
const worse = (g1: Grade, g2: Grade) => (order.indexOf(g1) >= order.indexOf(g2) ? g1 : g2);

export type DimensionResult = { id: DimensionId; name: string; weight: number; score: number | null; answered: number };

export type Result = {
  total: number;
  scoreGrade: Grade;
  grade: Grade;
  label: string;
  meaning: string;
  readiness: string;
  dimensions: DimensionResult[];
  ratios: Ratio[];
  flags: RedFlag[];
  actions: { dimension: string; text: string; gap: number }[];
};

export function score(a: Answers, type: BusinessType = "sme"): Result {
  const r = ratios(a);
  const weights = typeWeights[type];
  const dims: DimensionResult[] = dimensions.map((d) => {
    let got = 0, max = 0, answered = 0;
    for (const q of questions.filter((q) => q.dimension === d.id && isVisible(q, a, type))) {
      const s = responseScore(q, a);
      if (s === null) continue;
      got += q.weight * s;
      max += q.weight * 100;
      answered++;
    }
    // F2 (audited) is skipped when F1 is No; it then counts as not audited.
    if (d.id === "financial" && a.F1 === "no") max += 5 * 100;
    if (d.id === "financial")
      for (const x of r) if (x.score !== null) {
        got += RATIO_WEIGHT * x.score;
        max += RATIO_WEIGHT * 100;
        answered++;
      }
    return { id: d.id, name: d.name, weight: weights[d.id], score: max ? (got / max) * 100 : null, answered };
  });

  // Dimensions with nothing scored (or no weight for this business type) are left out and the remaining weights rescaled.
  const scored = dims.filter((d) => d.score !== null && d.weight > 0);
  const weightSum = scored.reduce((s, d) => s + d.weight, 0);
  const total = weightSum ? scored.reduce((s, d) => s + (d.score! * d.weight) / weightSum, 0) : 0;

  const band = gradeBands.find((b) => Math.round(total) >= b.min)!;
  const flags = redFlags(a, r);
  const grade = flags.reduce<Grade>((g, f) => worse(g, f.cap), band.grade);
  const final = gradeBands.find((b) => b.grade === grade)!;

  const investment = dims.find((d) => d.id === "investment")?.score ?? 0;
  const readiness =
    grade === "A" && investment >= 80 && flags.length === 0
      ? "A+ Investment Ready"
      : { A: "A Strong", B: "B Healthy", C: "C Developing", D: "D Vulnerable", E: "E Critical" }[grade];

  const dimName = Object.fromEntries(dimensions.map((d) => [d.id, d.name]));
  const actions = questions
    .filter((q) => isVisible(q, a, type) && q.action)
    .map((q) => {
      const s = responseScore(q, a);
      return { dimension: dimName[q.dimension], text: q.action, gap: s === null ? 0 : ((100 - s) * q.weight * weights[q.dimension]) / 100 };
    })
    .filter((x) => x.gap > 0)
    .sort((x, y) => y.gap - x.gap);

  return { total, scoreGrade: band.grade, grade, label: final.label, meaning: final.meaning, readiness, dimensions: dims, ratios: r, flags, actions };
}
