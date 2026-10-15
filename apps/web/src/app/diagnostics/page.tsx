import type { Metadata } from "next";
import { ButtonLink, Card, CardGrid, CtaBand, DataTable, Note, PageHero, Section, Tbc } from "@/components/ui";

export const metadata: Metadata = {
  title: "Free Business Health Check · EABIX",
  description:
    "Score your business across finance, operations, market, people and governance. Get an A to E grade and next steps in 20 minutes.",
};

export default function DiagnosticsPage() {
  return (
    <>
      <PageHero
        eyebrow="Business Health Check"
        title="Know exactly where your business stands."
        subhead="The EABIX Business Health Check scores your business across five areas and gives you a clear A to E grade, a plain-language report and the next steps that matter most."
      >
        <ButtonLink href="/join" variant="light">
          Start my free Health Check
        </ButtonLink>
        <p className="w-full text-sm text-brand-100">Takes about 20 minutes. Save and return any time.</p>
      </PageHero>

      <Section title="The five areas we assess">
        <DataTable
          head={["Area", "What we look at"]}
          rows={[
            ["Financial health", "Profitability, cash flow, debt levels, working capital and the quality of your records"],
            ["Operations", "Processes, capacity, suppliers, quality and cost control"],
            ["Market and customers", "Demand, competition, pricing power and customer concentration"],
            ["People and leadership", "Management depth, key-person risk, skills and culture"],
            ["Governance and compliance", "Legal structure, licenses, tax standing, board and controls"],
          ]}
        />
      </Section>

      <Section tone="canvas" title="What the grades mean">
        <DataTable
          head={["Grade", "Meaning", "What we suggest next"]}
          rows={[
            ["A", "Strong and investment-ready", "List in the marketplace and apply for a curated deal room"],
            ["B", "Healthy with a few gaps", "Fix the gaps flagged in your report, then list"],
            ["C", "Stable but vulnerable", "Work with a mentor or advisor on a 90-day improvement plan"],
            ["D", "Under significant pressure", "Talk to a recovery advisor soon"],
            ["E", "In distress", "Start a recovery assessment now; options still exist"],
          ]}
        />
      </Section>

      <Section title="Two levels">
        <CardGrid cols={2}>
          <Card title="Free self-assessment">
            Answer guided questions and get an instant indicative grade and summary.
          </Card>
          <Card
            title={
              <>
                Verified Health Check (<Tbc>price</Tbc> ETB)
              </>
            }
          >
            Upload financial statements and documents. An EABIX analyst reviews them and issues a verified grade that
            investors can trust, valid for 12 months.
          </Card>
        </CardGrid>
        <div className="mt-8 space-y-4">
          <p className="text-lg text-ink">
            Your answers are private. Your grade is shown to others only if you choose to publish it on your listing.
          </p>
          <Note>The Health Check is a management tool, not an audit, credit rating or investment recommendation.</Note>
        </div>
      </Section>

      <CtaBand title="Know exactly where your business stands." body="Takes about 20 minutes. Save and return any time.">
        <ButtonLink href="/join" variant="light">
          Start my free Health Check
        </ButtonLink>
      </CtaBand>
    </>
  );
}
