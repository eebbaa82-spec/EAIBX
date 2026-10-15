import Link from "next/link";
import { brand, company, footerColumns, legalLinks, socialLinks } from "@/lib/site";
import { NewsletterForm } from "./forms";
import { Container } from "./ui";

export function Footer() {
  return (
    <footer className="bg-ink text-sm text-slate-300">
      <div className="border-b border-white/10 py-10">
        <Container className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-white">The EABIX Brief</p>
            <p className="mt-1 max-w-md">Deals, programs and insights from Ethiopia&apos;s growth economy, every two weeks.</p>
          </div>
          <NewsletterForm />
        </Container>
      </div>

      <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_repeat(5,1fr)]">
        <div>
          <p className="text-xl font-extrabold text-white">EABIX</p>
          <p className="mt-2">
            EABIX, the {brand.fullName}. {brand.tagline}
          </p>
          <p className="mt-2">A platform by {brand.operator}.</p>
        </div>
        {footerColumns.map((col) => (
          <div key={col.heading}>
            <p className="mb-3 font-semibold text-white">{col.heading}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
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
            {company.address} · <a href={`tel:${company.phoneOffice.replace(/ /g, "")}`} className="hover:text-white">{company.phoneOffice}</a> ·{" "}
            <a href={`mailto:${company.email}`} className="hover:text-white">{company.email}</a> · {socialLinks.join(" · ")}
          </p>
          <p>
            © 2026 {brand.operator}. Registered in Ethiopia, registration no. {company.registrationNo}. EABIX is a business
            matching and information platform. It does not provide investment advice and is not a securities exchange.
          </p>
          <ul className="flex flex-wrap gap-4">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
