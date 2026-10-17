import type { Metadata } from "next";
import Link from "next/link";
import { EhiraAssessment } from "@/components/tools/EhiraAssessment";
import { ButtonLink, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "EHIRA: Enterprise Health & Investment Readiness Assessment · Kena",
  description:
    "Score your business across eight dimensions, from financial health to investment readiness, and get an A to E grade, a readiness rating and priority actions.",
};

export default function EhiraPage() {
  return (
    <>
      <div className="print:hidden">
        <PageHero
          eyebrow="EHIRA"
          title="Enterprise Health & Investment Readiness Assessment"
          subhead="Find out how healthy your business is and how ready it is for investors and lenders."
        >
          <ButtonLink href="#assessment" variant="light">
            Start my free EHIRA
          </ButtonLink>
          <p className="w-full text-sm text-brand-100">About 15 minutes, one question at a time. Have your tax clearance certificate ready.</p>
        </PageHero>

        <Section tone="canvas" title="What EHIRA does">
          <ul className="max-w-3xl list-disc space-y-2 pl-5 text-ink">
            <li>EHIRA scores your business across eight dimensions, from financial health to investment readiness, weighted for your type of business.</li>
            <li>You get an A to E grade, an investment readiness rating and the actions that will lift your score the most.</li>
            <li>The free self-assessment is indicative, while the verified EHIRA, reviewed by a Kena analyst, gives a grade lenders and investors can rely on.</li>
          </ul>
          <p className="mt-4">
            <Link href="/diagnostics/how-it-works" className="font-semibold text-brand-700 hover:underline">
              See how EHIRA works in detail →
            </Link>
          </p>
        </Section>
      </div>

      <Section id="assessment" title="Take the assessment">
        <EhiraAssessment />
      </Section>
    </>
  );
}
