import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { PageHero, Section } from "@/components/ui";

export type LegalDocKey = "terms" | "privacy" | "investor-disclaimer" | "cookies" | "community" | "nda";

type LegalDoc = { title: string; summary: string; sections: ReactNode[] };

export const legalDocs: Record<LegalDocKey, LegalDoc> = {
  terms: {
    title: "Terms of Use",
    summary:
      "These terms explain how you may use Kenna Ventures, what we are responsible for and what you are responsible for. By creating an account you agree to them.",
    sections: [
      "Eligibility",
      "Accounts and verification",
      "Listings and accuracy of information",
      "Introductions and transactions between users",
      "Fees and payments",
      "Intellectual property",
      "Prohibited use",
      "Suspension",
      "Liability limits",
      "Governing law (Ethiopia) and disputes",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    summary: "We collect only what we need to run Kenna Ventures, we never sell your data, and you control what other users see.",
    sections: [
      "Data we collect",
      "How we use it",
      "Sharing with users you approve",
      "Service providers and hosting location",
      "Retention",
      "Your rights",
      "Security",
      <>
        Compliance with Ethiopia&apos;s Personal Data Protection Proclamation No. 1321/2024
      </>,
      "Contact for privacy requests",
    ],
  },
  "investor-disclaimer": {
    title: "Investor Disclaimer",
    summary:
      "Investing in private businesses carries risk, including losing all of your money. Kenna Ventures does not give investment advice.",
    sections: [
      "Nature of the platform",
      "No offer of securities",
      "Risk warnings",
      "EHIRA grades are not ratings or recommendations",
      "Due diligence is your responsibility",
      "Foreign investor rules",
    ],
  },
  cookies: {
    title: "Cookie Policy",
    summary: "We use cookies to keep you signed in and improve Kenna Ventures. You choose which ones we use.",
    sections: ["Essential, preference and analytics cookies", "Third-party cookies", "How to change settings"],
  },
  community: {
    title: "Community Guidelines",
    summary: "Be honest, be respectful and protect other people's confidential information.",
    sections: [
      "Honest listings",
      "Respectful conduct",
      "Confidentiality and NDAs",
      "No solicitation outside agreed terms",
      "Mentor conduct",
      "Reporting and enforcement",
    ],
  },
  nda: {
    title: "Data Room Confidentiality Agreement",
    summary:
      "When you enter a data room you agree to keep what you see confidential and use it only to evaluate the deal.",
    sections: [
      "Definition of confidential information",
      "Permitted use",
      "Duration",
      "Return or destruction",
      "Remedies",
    ],
  },
};

const order: LegalDocKey[] = ["terms", "privacy", "investor-disclaimer", "cookies", "community", "nda"];

export function legalMetadata(key: LegalDocKey): Metadata {
  const doc = legalDocs[key];
  return { title: `${doc.title} · Kenna Ventures`, description: doc.summary };
}

export function LegalPage({ doc: key }: { doc: LegalDocKey }) {
  const doc = legalDocs[key];
  return (
    <>
      <PageHero eyebrow="Legal" title={doc.title} subhead={doc.summary} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_16rem]">
          <div>
            <div
              role="note"
              className="mb-8 rounded-lg border-2 border-dashed border-gold-500 bg-gold-100 p-4 text-sm font-medium text-ink"
            >
              Draft outline only. These are plain-language summaries and section outlines. Final wording must be drafted or
              approved by Ethiopian legal counsel before launch.
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Sections</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-6 text-ink">
              {doc.sections.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
          <nav aria-label="Legal pages" className="text-sm">
            <h2 className="font-semibold text-ink">Legal pages</h2>
            <ul className="mt-3 space-y-2">
              {order.map((k) => (
                <li key={k}>
                  <Link
                    href={`/legal/${k}`}
                    aria-current={k === key ? "page" : undefined}
                    className={k === key ? "font-semibold text-brand-700" : "text-muted hover:text-brand-700"}
                  >
                    {legalDocs[k].title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Section>
    </>
  );
}
