"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { mainNav } from "@/lib/site";
import { Container } from "./ui";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();

  // Close any open menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobileOpen(false);
    setOpenMenu(null);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="EABIX home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-black text-white">E</span>
          <span className="text-xl font-extrabold tracking-tight text-brand-900">EABIX</span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((menu) =>
              menu.items ? (
                <li
                  key={menu.label}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(menu.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    type="button"
                    className="rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-canvas"
                    aria-expanded={openMenu === menu.label}
                    onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
                  >
                    {menu.label}
                  </button>
                  {openMenu === menu.label && (
                    <div className="absolute left-0 top-full w-80 pt-2">
                      <ul className="rounded-xl border border-line bg-white p-2 shadow-lg">
                        {menu.items.map((item) => (
                          <li key={item.href}>
                            <Link href={item.href} className="block rounded-lg px-3 py-2 hover:bg-brand-50">
                              <span className="block text-sm font-semibold text-ink">{item.label}</span>
                              {item.description && <span className="block text-xs text-muted">{item.description}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ) : (
                <li key={menu.label}>
                  <Link href={menu.href!} className="rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-canvas">
                    {menu.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitch />
          <Link href="/login" className="text-sm font-medium text-ink hover:text-brand-700">
            Log in
          </Link>
          <Link href="/join" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Join EABIX
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-ink lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </Container>

      {mobileOpen && (
        <nav id="mobile-menu" aria-label="Main" className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-white lg:hidden">
          <Container className="py-4">
            {mainNav.map((menu) => (
              <div key={menu.label} className="border-b border-line py-3 last:border-0">
                {menu.items ? (
                  <>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{menu.label}</p>
                    <ul>
                      {menu.items.map((item) => (
                        <li key={item.href}>
                          <Link href={item.href} className="block py-1.5 text-ink">
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link href={menu.href!} className="block py-1.5 font-semibold text-ink">
                    {menu.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="mt-4 flex items-center gap-3">
              <Link href="/join" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                Join EABIX
              </Link>
              <Link href="/login" className="text-sm font-medium text-ink">
                Log in
              </Link>
              <LanguageSwitch />
            </div>
          </Container>
        </nav>
      )}
    </header>
  );
}

function LanguageSwitch() {
  return (
    <span className="flex items-center gap-1 text-sm" aria-label="Language">
      <span className="font-semibold text-ink" aria-current="true">
        EN
      </span>
      <span className="text-line">|</span>
      <span className="cursor-not-allowed text-muted" title="Amharic version coming soon" aria-disabled="true">
        አማ
      </span>
    </span>
  );
}
