import type { Metadata } from "next";
import { EhiraAssessment } from "@/components/tools/EhiraAssessment";
import { ButtonLink, Card, CardGrid, DataTable, Note, PageHero, Section } from "@/components/ui";
import { dimensions, gradeBands } from "@/lib/ehira/model";

export const metadata: Metadata = {
  title: "EHIRA: Enterprise Health & Investment Readiness Assessment · EABIX",
  description:
    "Score your business across eight dimensions, from financial health to investment readiness, and get an A to E grade, a readiness rating and priority actions.",
};

const covers: Record<string, string> = {
  financial: "Financial statements, audit, profitability, liquidity, leverage and debt service",
  market: "Customer base, retention, satisfaction and dependence on the largest customer",
  operations: "On-time delivery, documented procedures and quality management",
  people: "Staff turnover, training investment and succession planning",
  governance: "Board, internal controls and tax compliance",
  strategy: "Strategic plan and monthly KPI monitoring",
  technology: "Accounting or ERP systems and cybersecurity",
  investment: "Business plan, financial model and investor pitch deck",
};

export default function EhiraPage() {
  return (
    <>
      <div className="print:hidden">
        <PageHero
          eyebrow="EHIRA"
          title="Enterprise Health & Investment Readiness Assessment"
          subhead="Find out how healthy your business is and how ready it is for investors and lenders. EHIRA scores eight dimensions, gives an A to E grade and a readiness rating, and lists the actions that will lift your score the most."
        >
          <ButtonLink href="#assessment" variant="light">
            Start my free EHIRA
          </ButtonLink>
          <p className="w-full text-sm text-brand-100">About 15 minutes. Free self-assessment with an instant report.</p>
        </PageHero>

        <Section title="Eight dimensions">
          <DataTable
            head={["Dimension", "Weight", "What we look at"]}
            rows={dimensions.map((d) => [d.name, `${d.weight}%`, covers[d.id]])}
          />
          <p className="mt-4 text-sm text-muted">
            Weights shown are for the standard SME model. Startup, corporate and distressed-business versions shift the emphasis to what
            matters most at each stage.
          </p>
        </Section>

        <Section tone="canvas" title="What the grades mean">
          <DataTable
            head={["Grade", "Score", "Meaning"]}
            rows={gradeBands.map((b, i) => [
              b.grade,
              i === 0 ? "90 to 100" : i === gradeBands.length - 1 ? "Below 60" : `${b.min} to ${gradeBands[i - 1].min - 1}`,
              `${b.label}. ${b.meaning}`,
            ])}
          />
          <p className="mt-4 text-ink">
            Some answers cap the grade however high the score: for example, no annual financial statements or overdue tax filings limit
            the grade to C, and negative equity or debt service coverage below 1.0 limit it to D.
          </p>
        </Section>

        <Section title="Two levels">
          <CardGrid cols={2}>
            <Card title="Free self-assessment">
              Answer the guided questions below and get an instant indicative grade, readiness rating and action list.
            </Card>
            <Card title="Verified EHIRA (price announced after the launch period)">
              Upload your financial statements and supporting documents. An EABIX analyst reviews them and issues a verified grade
              that investors and lenders can rely on, valid for 12 months.
            </Card>
          </CardGrid>
          <div className="mt-6">
            <Note>
              EHIRA is a decision-support and readiness tool. It does not replace a credit rating, an audit, legal due diligence or a
              lender&apos;s decision.
            </Note>
          </div>
        </Section>
      </div>

      <Section id="assessment" tone="canvas" title="Take the assessment">
        <EhiraAssessment />
      </Section>
    </>
  );
}
