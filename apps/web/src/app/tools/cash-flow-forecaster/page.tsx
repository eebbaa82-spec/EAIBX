import type { Metadata } from "next";
import { CashflowForecaster } from "@/components/tools/CashflowForecaster";
import { ButtonLink, CtaBand, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Cash Flow Forecaster · Erudite Connect",
  description: "Project your cash position for the next 12 months and see shortfalls before they happen.",
};

export default function CashflowPage() {
  return (
    <>
      <PageHero
        title="Cash flow forecaster"
        subhead="Enter your sales, costs and loan repayments to see your cash position month by month for the next year, and spot shortfalls before they happen."
      />
      <Section title="Your 12-month forecast">
        <CashflowForecaster />
      </Section>
      <CtaBand title="Running short?" body="See how much you could borrow, or get a recovery plan from accredited advisors.">
        <ButtonLink href="/tools/loan-calculator" variant="light">
          Open the loan calculator
        </ButtonLink>
        <ButtonLink href="/recovery" variant="ghost" className="text-white">
          Business Recovery
        </ButtonLink>
      </CtaBand>
    </>
  );
}
