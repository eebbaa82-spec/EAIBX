import type { Metadata } from "next";
import { ButtonLink, Card, CardGrid, DataTable, Note, PageHero, Section } from "@/components/ui";
import { businessTypes, dimensions, gradeBands, typeWeights } from "@/lib/ehira/model";

export const metadata: Metadata = {
  title: "How EHIRA works · Kena",
  description: "The dimensions, weights, grades and red flags behind the Enterprise Health & Investment Readiness Assessment.",
};

const covers: Record<string, string> = {
  financial: "Financial statements and audit, profitability, liquidity, leverage, debt service, cash reserves and loan arrears",
  market: "Customer base, retention, satisfaction, customer concentration, written contracts and traceable payments",
  operations: "On-time delivery, procedures, quality, dependence on imported inputs and on a single supplier",
  people: "Staff turnover, training, succession, pension registration and employment contracts",
  governance: "Board, internal controls, tax clearance, IFRS reporting and up-to-date company records",
  strategy: "Strategic plan, monthly KPIs, budgeting and, for businesses under pressure, a turnaround plan",
  technology: "Accounting or ERP systems, cybersecurity and system-issued invoices",
  investment: "Business plan, financial model, pitch deck, funding needs, credit record and collateral",
};

export default function EhiraMethodPage() {
  return (
    <>
      <PageHero
        eyebrow="EHIRA"
        title="How EHIRA works"
        subhead="The dimensions, weights, grades and red flags behind the Enterprise Health & Investment Readiness Assessment."
      >
        <ButtonLink href="/diagnostics#assessment" variant="light">
          Start my free EHIRA
        </ButtonLink>
      </PageHero>

      <Section title="Eight dimensions">
        <DataTable head={["Dimension", "What we look at"]} rows={dimensions.map((d) => [d.name, covers[d.id]])} />
      </Section>

      <Section tone="canvas" title="Weighted for your type of business" intro="Each version puts the weight where it matters most at that stage.">
        <DataTable
          head={["Dimension", ...businessTypes.map((t) => t.label)]}
          rows={dimensions.map((d) => [d.name, ...businessTypes.map((t) => (typeWeights[t.id][d.id] ? `${typeWeights[t.id][d.id]}%` : "–"))])}
        />
      </Section>

      <Section title="What the grades mean">
        <DataTable
          head={["Grade", "Score", "Meaning"]}
          rows={gradeBands.map((b, i) => [
            b.grade,
            i === 0 ? "90 to 100" : i === gradeBands.length - 1 ? "Below 60" : `${b.min} to ${gradeBands[i - 1].min - 1}`,
            `${b.label}. ${b.meaning}`,
          ])}
        />
        <p className="mt-4 text-ink">
          Some answers cap the grade however high the score: for example, no annual financial statements or an expired tax clearance
          certificate limit the grade to C, and negative equity, debt service coverage below 1.0 or a loan more than 90 days overdue limit it
          to D.
        </p>
      </Section>

      <Section tone="canvas" title="Two levels">
        <CardGrid cols={2}>
          <Card title="Free self-assessment">
            Answer the guided questions one at a time and get an instant indicative grade, readiness rating and action list.
          </Card>
          <Card title="Verified EHIRA (price announced after the launch period)">
            Upload your financial statements, tax clearance certificate and supporting documents. A Kena analyst reviews them and issues a
            verified grade that investors and lenders can rely on, valid for 12 months.
          </Card>
        </CardGrid>
        <div className="mt-6">
          <Note>
            EHIRA is a decision-support and readiness tool. It does not replace a credit rating, an audit, legal due diligence or a
            lender&apos;s decision.
          </Note>
        </div>
      </Section>
    </>
  );
}
