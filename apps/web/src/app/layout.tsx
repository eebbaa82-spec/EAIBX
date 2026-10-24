import type { Metadata } from "next";
import { Inter, Noto_Sans_Ethiopic } from "next/font/google";
import { CookieBanner } from "@/components/CookieBanner";
import { CoeFooter, CoeHeader } from "@/components/CoeChrome";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { academy, brand, company, isCoe } from "@/lib/site";
import { indexingAllowed, siteUrl } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const ethiopic = Noto_Sans_Ethiopic({ variable: "--font-ethiopic", subsets: ["ethiopic"] });

const description = isCoe
  ? "Practical, certified training in banking, credit, interest-free finance, tax, capital markets and business skills, built for Ethiopia, with workplace simulations and institutional plans for banks and MFIs."
  : "Raise capital, sell a business, join an accelerator or recover from hard times. Verified Ethiopian businesses and investors in one place.";
const name = isCoe ? academy.name : brand.name;
const title = isCoe ? `${academy.name} · Banking and Finance Training` : "Investopia · Powering Smarter Business Decisions";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: name,
  title: { default: title, template: "%s" },
  description,
  openGraph: {
    type: "website",
    siteName: name,
    locale: "en_US",
    title,
    description,
    ...(isCoe ? {} : { images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Investopia: Powering Smarter Business Decisions" }] }),
  },
  twitter: {
    card: isCoe ? "summary" : "summary_large_image",
    title,
    description,
    ...(isCoe ? {} : { images: ["/og-image.png"] }),
  },
  // Search engines stay out unless the production publish turns indexing on.
  robots: indexingAllowed ? { index: true, follow: true } : { index: false, follow: false },
};

/** Tells search engines who runs the site (schema.org Organization). */
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name,
  url: siteUrl,
  slogan: isCoe ? academy.tagline : brand.tagline,
  email: company.email,
  telephone: company.phoneOffice,
  parentOrganization: { "@type": "Organization", name: brand.operator, url: `https://${company.website}` },
  address: {
    "@type": "PostalAddress",
    streetAddress: company.address,
    addressLocality: "Addis Ababa",
    addressCountry: "ET",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-site={isCoe ? "coe" : undefined}>
      <body className={`${inter.variable} ${ethiopic.variable} font-sans antialiased`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:p-2">
          Skip to content
        </a>
        {isCoe ? <CoeHeader /> : <Header />}
        <main id="main">{children}</main>
        {isCoe ? <CoeFooter /> : <Footer />}
        <CookieBanner />
      </body>
    </html>
  );
}
