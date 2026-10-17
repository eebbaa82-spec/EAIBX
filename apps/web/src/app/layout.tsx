import type { Metadata } from "next";
import { Inter, Noto_Sans_Ethiopic } from "next/font/google";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const ethiopic = Noto_Sans_Ethiopic({ variable: "--font-ethiopic", subsets: ["ethiopic"] });

export const metadata: Metadata = {
  title: {
    default: "Kena · Building Trust in Every Deal",
    template: "%s",
  },
  description:
    "Raise capital, sell a business, join an accelerator or recover from hard times. Verified Ethiopian businesses and investors in one place.",
  // Search engines stay out unless the production publish turns indexing on.
  robots: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true" ? { index: true, follow: true } : { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ethiopic.variable} font-sans antialiased`}>
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
