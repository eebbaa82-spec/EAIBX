import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getLibrary } from "@/lib/library";
import { getSectorReports, type SectorSource } from "@/lib/sectors";
import { slugOf } from "./select";

/**
 * Official-source context for the credit analysis workspace, read at build time
 * from the sector reports, the regional fact file and the regulations library.
 * Sources are cited by publisher and date only: pages never carry source URLs.
 */

export type Cited = { text: string; cite: string; label?: string; period?: string };
export type SectorContext = { slug: string; name: string; asOf: string; summary: string; indicators: Cited[]; opportunities: Cited[]; incentives: Cited[]; points: Cited[] };
export type RegionContext = {
  slug: string;
  name: string;
  type: string;
  capital: string;
  summary: string;
  asOf: string;
  office: string;
  indicators: Cited[];
  economy: Cited[];
  parks: Cited[];
  opportunities: Cited[];
  considerations: Cited[];
};
export type RegulationContext = { id: string; number: string; title: string; issuer: string; date: string; status: string; topic: string; relevance: string; category: string };
export type AnalysisContext = { sectors: SectorContext[]; economy: SectorContext | null; regions: RegionContext[]; regulations: RegulationContext[] };

type RawSource = Pick<SectorSource, "id" | "publisher" | "date">;
const citer = (sources: RawSource[]) => (id: string) => {
  const s = sources.find((x) => x.id === id);
  return s ? `${s.publisher}${s.date ? `, ${s.date}` : ""}` : "";
};

type RawRegion = {
  slug: string;
  name: string;
  type: string;
  capital: string;
  summary: string;
  investmentOffice?: string | null;
  indicators?: { label: string; value: string; period?: string; source: string }[];
  economy?: { detail: string; source: string }[];
  industrialParks?: { name: string; detail: string; source: string }[];
  opportunities?: { title: string; detail: string; source: string }[];
  considerations?: { detail: string; source: string }[];
  sources: RawSource[];
};

function regions(): RegionContext[] {
  const file = path.join(process.cwd(), "src/data/regions/regions.json");
  if (!existsSync(file)) return [];
  const data = JSON.parse(readFileSync(file, "utf8")) as { asOf: string; regions: RawRegion[] };
  return data.regions.map((r) => {
    const cite = citer(r.sources);
    return {
      slug: slugOf(r.name),
      name: r.name,
      type: r.type,
      // Multi-center regions have no single seat, and a city is its own capital.
      capital: /multi-center/i.test(r.capital) || r.capital.startsWith(r.name) ? "" : r.capital,
      summary: r.summary,
      asOf: data.asOf,
      office: r.investmentOffice ?? "",
      indicators: (r.indicators ?? []).map((i) => ({ label: i.label, text: i.value, period: i.period, cite: cite(i.source) })),
      economy: (r.economy ?? []).map((i) => ({ text: i.detail, cite: cite(i.source) })),
      parks: (r.industrialParks ?? []).map((i) => ({ label: i.name, text: i.detail, cite: cite(i.source) })),
      opportunities: (r.opportunities ?? []).map((i) => ({ label: i.title, text: i.detail, cite: cite(i.source) })),
      considerations: (r.considerations ?? []).map((i) => ({ text: i.detail, cite: cite(i.source) })),
    };
  });
}

export function getAnalysisContext(): AnalysisContext {
  const reports = getSectorReports().map((r): SectorContext => {
    const cite = citer(r.sources);
    return {
      slug: r.slug,
      name: r.name,
      asOf: r.asOf,
      summary: r.summary,
      indicators: r.indicators.map((i) => ({ label: i.label, text: i.value, period: i.period, cite: cite(i.source) })),
      opportunities: r.opportunities.map((o) => ({ label: o.title, text: o.detail, cite: cite(o.source) })),
      incentives: r.incentives.map((o) => ({ text: o.detail, cite: cite(o.source) })),
      points: r.risks.map((o) => ({ text: o.detail, cite: cite(o.source) })),
    };
  });
  const regulations = getLibrary().flatMap((cat) =>
    cat.documents
      .filter((d) => /^(Directive|Proclamation|Council of Ministers Regulation|Regulation)/.test(d.number) && !/draft|repealed/i.test(d.status))
      .map((d, i) => ({ id: `${cat.slug}-${i}`, number: d.number, title: d.title, issuer: d.issuer, date: d.date, status: d.status, topic: d.topic, relevance: d.relevance, category: cat.name })),
  );
  // The same law can sit in two categories; keep its first listing.
  const seen = new Set<string>();
  const unique = regulations.filter((r) => (seen.has(r.number) ? false : (seen.add(r.number), true)));
  return {
    sectors: reports.filter((r) => r.slug !== "economy-overview"),
    economy: reports.find((r) => r.slug === "economy-overview") ?? null,
    regions: regions(),
    regulations: unique,
  };
}
