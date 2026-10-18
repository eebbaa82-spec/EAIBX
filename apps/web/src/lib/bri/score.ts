import { questions, screening, type Answers, type BusinessType } from "@/lib/ehira/model";
import { isVisible, ratios, responseScore, type Ratio } from "@/lib/ehira/score";
import { briQuestions, indices, itemText, kersWeights, maturityBands, type Band, type IndexId } from "./model";

const allQuestions = [...questions, ...briQuestions];

/** Score from 0 to 100 for one item, or null when it was not answered, does not apply, or is not provided. */
export function itemScore(id: string, a: Answers, type: BusinessType, r: Ratio[]): number | null {
  if (id.startsWith("ratio:")) return r.find((x) => x.id === id.slice(6))?.score ?? null;
  const s = screening.find((x) => x.id === id);
  if (s) return a[id] === undefined ? null : a[id] === s.flagIf ? 0 : 100;
  if (id === "F8") {
    if (a.F8_ROUTE === "declaration") return a.F8_AGREE === "yes" ? 100 : null;
    return a.F8 === "yes" ? 0 : a.F8 === "no" ? 100 : null;
  }
  const q = allQuestions.find((x) => x.id === id);
  if (!q || !isVisible(q, a, type)) return null;
  // F2 is skipped when there are no statements at all; that still means "not audited".
  if (id === "F2" && a.F1 === "no") return 0;
  return responseScore(q, a);
}

function itemLabel(id: string) {
  const q = allQuestions.find((x) => x.id === id);
  return { gap: itemText[id]?.gap ?? q?.text ?? id, action: itemText[id]?.action ?? q?.action ?? "" };
}

const bandFor = (score: number, bands: Band[]) => bands.find((b) => Math.round(score) >= b.min)!.label;

export type IndexResult = {
  id: IndexId;
  name: string;
  score: number | null;
  status: string;
  /** Share of the index's weight that had answers to score. */
  coverage: number;
  dimensions: { name: string; weight: number; score: number | null }[];
  gaps: { gap: string; action: string; impact: number }[];
};

export type BriResult = { indices: IndexResult[]; kers: number | null; maturity: string };

export function scoreBri(a: Answers, type: BusinessType = "sme"): BriResult {
  const r = ratios(a);
  const results: IndexResult[] = indices.map((ix) => {
    const gaps = new Map<string, { gap: string; action: string; impact: number }>();
    const dims = ix.dimensions.map((d) => {
      const scored = d.items.map((id) => ({ id, s: itemScore(id, a, type, r) })).filter((x) => x.s !== null) as { id: string; s: number }[];
      const score = scored.length ? scored.reduce((t, x) => t + x.s, 0) / scored.length : null;
      // Impact: the points of the index this item holds back.
      for (const x of scored)
        if (x.s < 60) {
          const { gap, action } = itemLabel(x.id);
          const impact = ((100 - x.s) * d.weight) / scored.length / 100;
          const prev = gaps.get(gap);
          if (!prev || prev.impact < impact) gaps.set(gap, { gap, action, impact });
        }
      return { name: d.name, weight: d.weight, score };
    });
    const live = dims.filter((d) => d.score !== null);
    const w = live.reduce((t, d) => t + d.weight, 0);
    const score = w ? live.reduce((t, d) => t + (d.score! * d.weight) / w, 0) : null;
    return {
      id: ix.id,
      name: ix.name,
      score,
      status: score === null ? "Not enough answers" : bandFor(score, ix.bands),
      coverage: w,
      dimensions: dims,
      gaps: [...gaps.values()].sort((x, y) => y.impact - x.impact),
    };
  });

  const scored = results.filter((x) => x.score !== null);
  const kw = scored.reduce((t, x) => t + kersWeights[x.id], 0);
  const kers = kw ? scored.reduce((t, x) => t + (x.score! * kersWeights[x.id]) / kw, 0) : null;
  return { indices: results, kers, maturity: kers === null ? "Not enough answers" : bandFor(kers, maturityBands) };
}
