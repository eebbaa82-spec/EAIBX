import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

export type LibraryDocument = {
  title: string;
  number: string;
  issuer: string;
  date: string;
  status: string;
  topic: string;
  summary: string;
  relevance: string;
  url: string;
  accessed: string;
};
export type LibraryCategory = { slug: string; name: string; intro: string; asOf: string; documents: LibraryDocument[] };

const order = ["nbe-directives", "finance-tax-laws", "investment-laws", "investment-incentives", "world-bank-research"];
const rank = (slug: string) => (order.includes(slug) ? order.indexOf(slug) : order.length);
const dataDir = path.join(process.cwd(), "src/data/library");

export function getLibrary(): LibraryCategory[] {
  return readdirSync(dataDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(path.join(dataDir, f), "utf8")) as LibraryCategory)
    .sort((a, b) => rank(a.slug) - rank(b.slug));
}

export const libraryPdfHref = (slug: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/downloads/library/Investopia-Digest-${slug}.pdf`;
