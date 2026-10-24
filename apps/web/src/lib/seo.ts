import { readdirSync } from "node:fs";
import { join } from "node:path";

import { academy, isCoe } from "./site";

/** The one public address the certificate covers; .htaccess redirects every other form here. */
export const siteUrl = isCoe ? academy.url : "https://investopia.et";

export const indexingAllowed = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

/** Account, sign-in and member-only form pages: useful to people, not to search results. */
const notForSearch = new Set(["/login", "/join", "/marketplace/new", "/investors/verify"]);

/** Every static page route, read from src/app at build time, so new pages join the sitemap on their own. */
export function publicRoutes(): string[] {
  const appDir = join(process.cwd(), "src", "app");
  const routes: string[] = [];
  const walk = (dir: string, route: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!/^[[(_@]/.test(entry.name)) walk(join(dir, entry.name), `${route}/${entry.name}`);
      } else if (entry.name === "page.tsx") {
        routes.push(route || "/");
      }
    }
  };
  walk(appDir, "");
  // The course site carries only the Academy; its other paths redirect to investopia.et.
  return routes.filter((r) => !notForSearch.has(r) && (!isCoe || /^\/(am\/)?academy(\/|$)/.test(r))).sort();
}
