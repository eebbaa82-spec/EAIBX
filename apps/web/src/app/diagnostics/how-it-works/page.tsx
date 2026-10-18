import type { Metadata } from "next";
import { ButtonLink, Card, CardGrid, DataTable, Note, PageHero, Section } from "@/components/ui";
import { businessTypes, dimensions, gradeBands, typeWeights } from "@/lib/ehira/model";
import { indices, kersWeights, maturityBands } from "@/lib/bri/model";

export const metadata: Metadata = {
  title: "How EHIRA works · Kena Hub",
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

      <Section
        tone="canvas"
        eyebrow="KENA™ Bank Readiness Index (BRI)"
        title="Six readiness scores and KERS™"
        intro="The same answers also produce six independent readiness scores from 0 to 100, for credit, investment, due diligence and transactions. They do not change the EHIRA grade."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {indices.map((ix) => (
            <div key={ix.id}>
              <h3 className="text-lg font-bold text-ink">
                {ix.name} ({ix.id})
              </h3>
              <p className="mt-1 text-sm text-muted">{ix.purpose}</p>
              <div className="mt-3">
                <DataTable head={["Dimension", "Weight"]} rows={ix.dimensions.map((d) => [d.name, `${d.weight}%`])} />
              </div>
              <p className="mt-2 text-sm text-muted">
                Rating: {ix.bands.map((b, i) => `${i === 0 ? `${b.min}+` : i === ix.bands.length - 1 ? `below ${ix.bands[i - 1].min}` : `${b.min} to ${ix.bands[i - 1].min - 1}`} ${b.label}`).join(" · ")}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-lg font-bold text-ink">KENA Enterprise Readiness Score (KERS™)</h3>
            <div className="mt-3">
              <DataTable head={["Index", "Weight"]} rows={indices.map((ix) => [ix.name, `${kersWeights[ix.id]}%`])} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">Enterprise maturity classification</h3>
            <div className="mt-3">
              <DataTable
                head={["KERS™", "Classification"]}
                rows={maturityBands.map((b, i) => [i === 0 ? "90 to 100" : i === maturityBands.length - 1 ? `Below ${maturityBands[i - 1].min}` : `${b.min} to ${maturityBands[i - 1].min - 1}`, b.label])}
              />
            </div>
          </div>
        </div>
        <p className="mt-6 text-ink">
          After scoring, Kena Hub lists the key gaps holding back each index below 80 and the actions that close them, such as obtaining a tax
          clearance certificate, registering movable assets in the collateral registry or preparing an investment memorandum.
        </p>
      </Section>

      <Section title="Two levels">
        <CardGrid cols={2}>
          <Card title="Free self-assessment">
            Take the quick self-check (selected questions, under 5 minutes) or the full assessment (about 20 minutes) and see your
            indicative grade, readiness scores and actions on screen. Downloadable reports are available with payment.
          </Card>
          <Card title="Verified EHIRA (price announced after the launch period)">
            Upload your financial statements, tax clearance certificate and supporting documents. A Kena Hub analyst reviews them and issues a
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
