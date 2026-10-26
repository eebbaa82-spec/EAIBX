import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

export type SectorSource = { id: string; title: string; publisher: string; date: string; url: string; location?: string; accessed: string };
export type SectorReport = {
  slug: string;
  name: string;
  asOf: string;
  summary: string;
  indicators: { label: string; value: string; period: string; source: string }[];
  returns: { label: string; value: string; period: string; basis: string; source: string }[];
  returnsNote?: string;
  opportunities: { title: string; detail: string; source: string }[];
  incentives: { detail: string; source: string }[];
  risks: { detail: string; source: string }[];
  sources: SectorSource[];
};

const dataDir = path.join(process.cwd(), "src/data/sectors");

/** The economy overview comes first, then sectors alphabetically. */
export function getSectorReports(): SectorReport[] {
  return readdirSync(dataDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(path.join(dataDir, f), "utf8")) as SectorReport)
    .sort((a, b) => (a.slug === "economy-overview" ? -1 : b.slug === "economy-overview" ? 1 : a.name.localeCompare(b.name)));
}

export const sectorPdfHref = (slug: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/downloads/sectors/Erudite-Connect-Sector-Report-${slug}.pdf`;

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
