import type { Metadata } from "next";
import { ButtonLink, Card, CardGrid, CtaBand, Note, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Free Business Valuation Calculator · Investopia",
  description: "Estimate what your business is worth, test your investment readiness and forecast cash flow, free.",
};

const tools = [
  {
    name: "Business Valuation Calculator",
    body: "Get an indicative value range for your business based on its financials and sector benchmarks.",
    button: "Value my business",
  },
  {
    name: "Investment Readiness Quiz",
    body: "Ten questions that tell you how close you are to being investor-ready.",
    button: "Take the quiz",
    href: "/tools/readiness-quiz",
  },
  {
    name: "Cash Flow Forecaster",
    body: "Project your cash position for the next 12 months and spot gaps early.",
    button: "Forecast my cash",
    href: "/tools/cash-flow-forecaster",
  },
  {
    name: "Loan Calculator",
    body: "Find the most you can borrow from what you can afford to pay, or see your installments for any loan, with flexible repayment frequency.",
    button: "Open the calculator",
    href: "/tools/loan-calculator",
  },
  {
    name: "Investopia AI Assistant",
    body: "Ask questions about your business, your listing or Ethiopian business rules, in Amharic or English.",
    button: "Ask the assistant",
  },
];

const valuationInputs = [
  "Annual revenue (last full financial year, ETB)",
  "Net profit or EBITDA (ETB)",
  "Sector",
  "Years trading",
  "Growth rate over the last two years",
  "Main assets",
];

export default function ToolsPage() {
  return (
    <>
      <PageHero
        title="Free tools for smarter decisions"
        subhead="Estimate what a business is worth, check whether you are ready to raise, and model your cash flow, in minutes."
      />

      <Section title="Tools">
        <CardGrid cols={3}>
          {tools.map((t) => (
            <Card
              key={t.name}
              title={t.name}
              footer={
                <ButtonLink href={("href" in t && t.href) || "/join"} variant="secondary" className="w-full">
                  {t.button}
                </ButtonLink>
              }
            >
              {t.body}
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Section
        id="valuation"
        tone="canvas"
        title="Business Valuation Calculator"
        intro="Answer a few questions about your business. You will get an indicative range, not a formal valuation."
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {valuationInputs.map((i) => (
            <li key={i} className="rounded-lg border border-line bg-white px-4 py-3 text-ink">
              {i}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/join">Value my business</ButtonLink>
        </div>
        <div className="mt-6">
          <Note>
            Results are estimates for information only and are not a professional valuation or investment advice.
          </Note>
        </div>
      </Section>

      <Section title="Investopia AI Assistant">
        <blockquote className="max-w-3xl rounded-xl border border-line bg-canvas p-6 text-ink">
          Hello, I am the Investopia assistant. I can help you understand your EHIRA report, improve your listing, find
          programs or explain business terms. I do not give financial or legal advice. What would you like to do today?
        </blockquote>
        <div className="mt-6">
          <ButtonLink href="/join">Ask the assistant</ButtonLink>
        </div>
      </Section>

      <CtaBand
        title="Want a valuation you can take to investors or buyers?"
        body="Book a certified valuer from our advisor directory."
      >
        <ButtonLink href="/advisors" variant="light">
          Find a valuer
        </ButtonLink>
      </CtaBand>
    </>
  );
}
