"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { translator } from "@/i18n/chrome";
import { localeFromPath, localizeHref } from "@/i18n/config";
import { brand, company, footerColumns, legalLinks, socialLinks } from "@/lib/site";
import { NewsletterForm } from "./forms";
import { Container } from "./ui";

export function Footer() {
  const locale = localeFromPath(usePathname());
  const t = translator(locale);
  const href = (h: string) => localizeHref(locale, h);
  return (
    <footer lang={locale} className="print:hidden bg-ink text-sm text-slate-300">
      <div className="border-b border-white/10 py-10">
        <Container className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-white">{t("The Kenna Ventures Brief")}</p>
            <p className="mt-1 max-w-md">{t("Deals, programs and insights from Ethiopia's growth economy, every two weeks.")}</p>
          </div>
          <NewsletterForm locale={locale} />
        </Container>
      </div>

      <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_repeat(5,1fr)]">
        <div>
          <p className="text-xl font-extrabold text-white">Kenna Ventures</p>
          <p className="mt-2">{t(brand.tagline)}</p>
          <p className="mt-2">{t(`A platform by ${brand.operator}.`)}</p>
        </div>
        {footerColumns.map((col) => (
          <div key={t(col.heading)}>
            <p className="mb-3 font-semibold text-white">{t(col.heading)}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={t(link.label)}>
                  <Link href={href(link.href)} className="hover:text-white">
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-white/10 py-8">
        <Container className="space-y-4">
          <p>
            {t(company.address)} · <a href={`tel:${company.phoneOffice.replace(/ /g, "")}`} className="hover:text-white">{company.phoneOffice}</a> ·{" "}
            <a href={`mailto:${company.email}`} className="hover:text-white">{company.email}</a> · {socialLinks.join(" · ")}
          </p>
          <p>{t("footerLegal", { reg: company.registrationNo })}</p>
          <ul className="flex flex-wrap gap-4">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={href(link.href)} className="hover:text-white">
                  {t(link.label)}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
