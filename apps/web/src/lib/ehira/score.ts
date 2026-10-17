import {
  dimensions,
  gradeBands,
  questions,
  RATIO_WEIGHT,
  ratioBands,
  screening,
  type Answers,
  type Band,
  type DimensionId,
  type Grade,
  type Question,
} from "./model";

/** First band whose threshold the value meets. Bands are listed from the highest threshold down. */
export function bandScore(value: number, bands: Band[]) {
  for (const b of bands) if (b.strict ? value > b.min : value >= b.min) return b.score;
  return bands[bands.length - 1].score;
}

export const isVisible = (q: Question, a: Answers) => !q.showIf || q.showIf(a);

/** Response score from 0 to 100, or null when the question is unscored or unanswered. */
export function responseScore(q: Question, a: Answers): number | null {
  const v = a[q.id];
  if (q.unscored || v === undefined || v === "na") return null;
  if (q.type === "yesno") return v === "yes" ? 100 : 0;
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

export type RedFlag = { flag: string; cap: Grade };

export function redFlags(a: Answers, r: Ratio[]): RedFlag[] {
  const flags: RedFlag[] = [];
  if (a.F1 === "no") flags.push({ flag: "No annual financial statements", cap: "C" });
  if (a.G3 === "no") flags.push({ flag: "Tax non-compliance", cap: "C" });
  const equity = num(a.FR4);
  if (equity !== undefined && equity < 0) flags.push({ flag: "Negative equity", cap: "D" });
  const dscr = r.find((x) => x.id === "dscr");
  if (dscr?.value !== null && dscr?.value !== undefined && dscr.value < 1) flags.push({ flag: "DSCR below 1.0", cap: "D" });
  for (const s of screening) if (a[s.id] === s.flagIf) flags.push({ flag: s.flag, cap: s.cap });
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

export function score(a: Answers): Result {
  const r = ratios(a);
  const dims: DimensionResult[] = dimensions.map((d) => {
    let got = 0, max = 0, answered = 0;
    for (const q of questions.filter((q) => q.dimension === d.id && isVisible(q, a))) {
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
    return { id: d.id, name: d.name, weight: d.weight, score: max ? (got / max) * 100 : null, answered };
  });

  // Dimensions with nothing scored are left out and the remaining weights are rescaled.
  const scored = dims.filter((d) => d.score !== null);
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

  const dimName = Object.fromEntries(dimensions.map((d) => [d.id, d]));
  const actions = questions
    .filter((q) => isVisible(q, a) && q.action)
    .map((q) => {
      const s = responseScore(q, a);
      const d = dimName[q.dimension];
      return { dimension: d.name, text: q.action, gap: s === null ? 0 : ((100 - s) * q.weight * d.weight) / 100 };
    })
    .filter((x) => x.gap > 0)
    .sort((x, y) => y.gap - x.gap);

  return { total, scoreGrade: band.grade, grade, label: final.label, meaning: final.meaning, readiness, dimensions: dims, ratios: r, flags, actions };
}
