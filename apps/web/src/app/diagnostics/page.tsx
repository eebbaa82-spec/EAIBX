import type { Metadata } from "next";
import Link from "next/link";
import { EhiraAssessment } from "@/components/tools/EhiraAssessment";
import { ButtonLink, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "EHIRA: Enterprise Health & Investment Readiness Assessment · Investopia",
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
            Start my free self-check
          </ButtonLink>
          <p className="w-full text-sm text-brand-100">A quick self-check in under 5 minutes, or the full assessment in about 20.</p>
        </PageHero>

        <Section tone="canvas" title="What EHIRA does">
          <ul className="max-w-3xl list-disc space-y-2 pl-5 text-ink">
            <li>EHIRA scores your business across eight dimensions, from financial health to investment readiness, weighted for your type of business.</li>
            <li>You get an A to E grade, the Investopia™ Bank Readiness Index with six readiness scores for credit, investment and transactions, and the actions that will lift them most.</li>
            <li>The free self-checks give indicative scores on screen; downloadable reports and the verified EHIRA, reviewed by an Investopia analyst, are paid services.</li>
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
