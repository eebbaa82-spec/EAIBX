"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { academy, brand, company } from "@/lib/site";
import { Container } from "./ui";

/**
 * Header and footer of the course site, the Erudite Africa Center of
 * Excellence (eruditeafrica.et). Built from the same code as Investopia with
 * NEXT_PUBLIC_SITE=coe; pages outside the Academy redirect to investopia.et.
 */

const nav = [
  { label: "All courses", href: "/academy/courses/" },
  { label: "Bank and MFI", href: "/academy/folders/bank-and-mfi/" },
  { label: "Financial Management", href: "/academy/folders/financial-management/" },
  { label: "Capital Market", href: "/academy/folders/capital-markets/" },
  { label: "General", href: "/academy/folders/general/" },
  { label: "Financial literacy", href: "/academy/financial-literacy/" },
  { label: "For institutions", href: "/academy/institution/" },
  { label: "Verify a certificate", href: "/academy/verify/" },
];

function Mark() {
  return (
    <Link href="/academy/" className="flex shrink-0 items-center gap-2" aria-label={`${academy.name} home`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/academy/brand/eai-mark.png" alt="" width={30} height={40} className="h-10 w-auto shrink-0" />
      <span className="leading-tight">
        <span className="block text-base font-extrabold tracking-tight text-brand-900">Erudite Africa</span>
        <span className="block text-xs font-semibold text-muted">{academy.short}</span>
      </span>
    </Link>
  );
}

export function CoeHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  const current = (h: string) => pathname === h || pathname === h.replace(/\/$/, "");
  return (
    <header className="print:hidden sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Mark />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {[nav[0], ...nav.slice(5)].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current(item.href) ? "page" : undefined}
                  className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium hover:bg-canvas ${current(item.href) ? "text-brand-700" : "text-ink"}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          className="rounded-md p-2 text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="coe-menu"
          onClick={() => setOpen(!open)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </Container>
      {open && (
        <nav id="coe-menu" aria-label="Main" className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-white lg:hidden">
          <Container className="py-3">
            <ul>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-brand-50">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}
    </header>
  );
}

export function CoeFooter() {
  return (
    <footer className="print:hidden bg-ink text-sm text-slate-300">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-xl font-extrabold text-white">{academy.name}</p>
          <p className="mt-2">{academy.tagline}</p>
          <p className="mt-2">By {brand.operator}.</p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">{academy.partner.role}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={academy.partner.logo} alt={academy.partner.name} width={508} height={120} className="mt-2 h-12 w-auto rounded-md bg-white p-1.5" />
        </div>
        <div>
          <p className="mb-3 font-semibold text-white">Courses</p>
          <ul className="space-y-2">
            {nav.slice(0, 6).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-white">More</p>
          <ul className="space-y-2">
            {nav.slice(6).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="https://investopia.et" className="hover:text-white">
                Investopia, our business and investment platform
              </a>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-white/10 py-8">
        <Container className="space-y-4">
          <p>
            {company.address} · <a href={`tel:${company.phoneOffice.replace(/ /g, "")}`} className="hover:text-white">{company.phoneOffice}</a> ·{" "}
            <a href={`mailto:${academy.email}`} className="hover:text-white">{academy.email}</a>
          </p>
          <p>
            © {new Date().getFullYear()} {brand.operator}. Registration {company.registrationNo}.
          </p>
          <ul className="flex flex-wrap gap-4">
            {[
              { label: "Terms", href: "https://investopia.et/legal/terms/" },
              { label: "Privacy", href: "https://investopia.et/legal/privacy/" },
              { label: "Cookies", href: "https://investopia.et/legal/cookies/" },
            ].map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
