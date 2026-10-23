import type { Metadata } from "next";
import { Inter, Noto_Sans_Ethiopic } from "next/font/google";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { brand, company } from "@/lib/site";
import { indexingAllowed, siteUrl } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const ethiopic = Noto_Sans_Ethiopic({ variable: "--font-ethiopic", subsets: ["ethiopic"] });

const description =
  "Raise capital, sell a business, join an accelerator or recover from hard times. Verified Ethiopian businesses and investors in one place.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: brand.name,
  title: {
    default: "Investopia · Powering Smarter Business Decisions",
    template: "%s",
  },
  description,
  openGraph: {
    type: "website",
    siteName: brand.name,
    locale: "en_US",
    title: "Investopia · Powering Smarter Business Decisions",
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Investopia: Powering Smarter Business Decisions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Investopia · Powering Smarter Business Decisions",
    description,
    images: ["/og-image.png"],
  },
  // Search engines stay out unless the production publish turns indexing on.
  robots: indexingAllowed ? { index: true, follow: true } : { index: false, follow: false },
};

/** Tells search engines who runs the site (schema.org Organization). */
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand.name,
  url: siteUrl,
  slogan: brand.tagline,
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
    <html lang="en">
      <body className={`${inter.variable} ${ethiopic.variable} font-sans antialiased`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:p-2">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
