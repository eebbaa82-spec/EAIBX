import type { CreditCase } from "./case";
import type { AnalysisContext, Cited, RegulationContext } from "./context";

/**
 * Which official-source items go into a case's report. Every item has an id; the
 * analyst ticks items in or out, and untouched items follow the defaults below,
 * so two borrowers in different sectors and regions get different context.
 */

export const regionNames = [
  "Addis Ababa",
  "Afar",
  "Amhara",
  "Benishangul-Gumuz",
  "Central Ethiopia",
  "Dire Dawa",
  "Gambella",
  "Harari",
  "Oromia",
  "Sidama",
  "Somali",
  "South Ethiopia",
  "South West Ethiopia Peoples'",
  "Tigray",
];

export const slugOf = (name: string) => name.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const defaults: Record<string, number> = { "s:ind": 4, "s:opp": 3, "s:inc": 2, "s:pt": 9, "r:ind": 9, "r:eco": 4, "r:park": 4, "r:opp": 3, "r:con": 9 };
const economyDefaults = /GDP growth$|Headline inflation|Exchange rate/i;

export function suggestedRegulation(k: CreditCase, r: RegulationContext) {
  if (/Interest rates/i.test(r.topic)) return true;
  if (/1395\/2025|1341\/2024/.test(r.number)) return true;
  if ((k.exporter || k.importer) && /Foreign exchange/i.test(r.topic) && !/^Directive No\. SBB/.test(r.number)) return true;
  if (["manufacturing", "agriculture-agro-processing", "health-pharmaceuticals", "ict-digital", "energy"].includes(k.sectorReport) && /Special economic zones|Industrial parks|^Incentives$/i.test(r.topic)) return true;
  return false;
}

export function isPicked(k: CreditCase, id: string, ctx?: AnalysisContext): boolean {
  if (id in k.picked) return k.picked[id];
  if (id.startsWith("reg:")) {
    const r = ctx?.regulations.find((x) => `reg:${x.id}` === id);
    return r ? suggestedRegulation(k, r) : false;
  }
  if (id.startsWith("e:ind:")) {
    const i = Number(id.split(":")[2]);
    return economyDefaults.test(ctx?.economy?.indicators[i]?.label ?? "");
  }
  const [a, b, i] = id.split(":");
  return Number(i) < (defaults[`${a}:${b}`] ?? 0);
}

export type Picked = { id: string; item: Cited }[];

export function selection(k: CreditCase, ctx: AnalysisContext) {
  const sector = ctx.sectors.find((s) => s.slug === k.sectorReport) ?? null;
  const region = ctx.regions.find((r) => r.slug === k.region) ?? null;
  const take = (prefix: string, items: Cited[] = []): Picked => items.map((item, i) => ({ id: `${prefix}:${i}`, item })).filter((x) => isPicked(k, x.id, ctx));
  return {
    sector,
    region,
    regionName: region?.name ?? regionNames.find((n) => slugOf(n) === k.region) ?? "",
    economy: take("e:ind", ctx.economy?.indicators),
    sectorIndicators: take("s:ind", sector?.indicators),
    sectorOpportunities: take("s:opp", sector?.opportunities),
    sectorIncentives: take("s:inc", sector?.incentives),
    sectorPoints: take("s:pt", sector?.points),
    regionIndicators: take("r:ind", region?.indicators),
    regionEconomy: take("r:eco", region?.economy),
    regionParks: take("r:park", region?.parks),
    regionOpportunities: take("r:opp", region?.opportunities),
    regionConsiderations: take("r:con", region?.considerations),
    regulations: ctx.regulations.filter((r) => isPicked(k, `reg:${r.id}`, ctx)),
  };
}
export type Selection = ReturnType<typeof selection>;

const clean = (s: string) => s.replace(/\s*\([^)]*\)/g, "").trim();
const firstSentence = (s: string) => {
  const t = s.trim().match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s.trim();
  return /[.!?]$/.test(t) ? t : `${t}.`;
};
const firstClause = (s: string) => s.split(/;|\s\(|, up from|, compared with/)[0].trim().replace(/[.,]$/, "");
const facts = (xs: Picked) => xs.filter(({ item }) => item.label).map(({ item }) => `${clean(item.label ?? "")} ${firstClause(item.text)}`);

/** The selected sector and regional facts as plain prose for the trading outlook. */
export function outlookFacts(k: CreditCase, sel: Selection) {
  const out: string[] = [];
  const list = (xs: string[]) => (xs.length ? `${xs.join("; ")}.` : "");
  if (sel.economy.length) out.push(`National economy: ${list(facts(sel.economy))}`);
  if (sel.sector) out.push(sel.sector.summary);
  if (sel.region) {
    const parks = sel.regionParks.map(({ item }) => clean(item.label ?? item.text));
    out.push(
      [`${sel.region.name}: ${sel.region.summary}`, list(facts(sel.regionIndicators)), parks.length && `Industrial parks and zones in the region include ${parks.join(", ")}.`].filter(Boolean).join(" "),
    );
  }
  if (k.contextUpdate.trim()) out.push(k.contextUpdate.trim());
  return out.join("\n\n");
}

/** Opportunities and threats for the SWOT, from the selected sector and regional items. */
export function contextSwot(sel: Selection) {
  const opp = (xs: Picked) => xs.map(({ item }) => (item.label ? `${clean(item.label)}: ${firstSentence(item.text)}` : firstSentence(item.text)));
  return {
    opportunities: [...opp(sel.sectorOpportunities).slice(0, 3), ...opp(sel.regionOpportunities).slice(0, 2), ...opp(sel.sectorIncentives).slice(0, 1)],
    threats: [...sel.sectorPoints.slice(0, 3), ...sel.regionConsiderations.slice(0, 2)].map(({ item }) => firstSentence(item.text)),
  };
}
