export const locales = ["en", "am", "om"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, { short: string; name: string }> = {
  en: { short: "EN", name: "English" },
  am: { short: "አማ", name: "አማርኛ" },
  om: { short: "OM", name: "Afaan Oromoo" },
};

/** Pages that exist in each language. Everything else links to the English page. */
export const translatedPaths: Record<Locale, string[]> = {
  en: [],
  am: ["/"],
  om: ["/"],
};

export function localeFromPath(pathname: string | null): Locale {
  const first = (pathname ?? "/").split("/")[1];
  return first === "am" || first === "om" ? first : "en";
}

/** The English path behind a localized path, e.g. /am/ -> /. */
export function basePath(pathname: string | null): string {
  const p = pathname ?? "/";
  const stripped = p.replace(/^\/(am|om)(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

const normalize = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);

/** Link to `href` in `locale` when that page is translated, otherwise to the English page. */
export function localizeHref(locale: Locale, href: string): string {
  if (locale === "en" || !href.startsWith("/")) return href;
  const [path, hash = ""] = href.split("#");
  if (!translatedPaths[locale].includes(normalize(path))) return href;
  const localized = path === "/" ? `/${locale}/` : `/${locale}${path}`;
  return hash ? `${localized}#${hash}` : localized;
}

export const isTranslated = (locale: Locale, path: string) =>
  locale === "en" || translatedPaths[locale].includes(normalize(path));
