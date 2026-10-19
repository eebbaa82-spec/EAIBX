import type { Metadata } from "next";
import { Note, PageHero, Section } from "@/components/ui";
import { formatDate, getSectorReports, sectorPdfHref } from "@/lib/sectors";

export const metadata: Metadata = {
  title: "Sector Investment Reports · Ethiopia",
  description:
    "Free monthly reports on investment opportunities, returns and incentives in each Ethiopian sector, sourced only from international institutions and the Ethiopian government.",
};

export default function SectorReportsPage() {
  const reports = getSectorReports();
  const latest = reports.reduce((d, r) => (r.asOf > d ? r.asOf : d), "");
  return (
    <>
      <PageHero
        eyebrow="Knowledge Hub"
        title="Sector investment reports"
        subhead="Where the opportunities are in Ethiopia, what returns are published, and which incentives apply, sector by sector. Every figure comes from a report by an international institution or the Ethiopian government, and the reports are refreshed every month."
      />
      <Section
        title="Download a report"
        intro={`${latest ? `Last updated ${formatDate(latest)}. ` : ""}The public edition of each report is free to download. The member edition, with the full list of sources, page references and links, is available to registered Investopia members.`}
      >
        <ul className="grid gap-5 md:grid-cols-2">
          {reports.map((r) => (
            <li key={r.slug} className="flex flex-col rounded-xl border border-line bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-ink">{r.name}</h3>
              <p className="mt-1 text-xs text-muted">
                Updated {formatDate(r.asOf)} · Fully referenced ({r.sources.length} sources, for members)
              </p>
              <p className="mt-3 flex-1 text-justify text-sm text-muted">{r.summary}</p>
              <p className="mt-3 text-sm text-ink">
                {r.returns.length > 0
                  ? `Published returns and yields: ${r.returns.length} figure${r.returns.length > 1 ? "s" : ""}`
                  : "No published sector return figure; related indicators included"}
              </p>
              <a
                href={sectorPdfHref(r.slug)}
                download
                className="mt-4 inline-flex w-fit rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Download PDF
              </a>
            </li>
          ))}
        </ul>
      </Section>
      <Section tone="canvas" title="How we prepare these reports">
        <div className="max-w-3xl space-y-4 text-justify text-muted">
          <p>
            We use only reports and official pages published by international institutions, such as the World Bank, IFC,
            IMF, African Development Bank and UN agencies, and by the Ethiopian government, such as the Ethiopian
            Investment Commission, the National Bank of Ethiopia and the line ministries. Figures are reproduced as
            published, with the source and date beside each one.
          </p>
          <p>
            Where no such source publishes an average return on investment for a sector, the report says so and shows the
            closest published indicators instead. We do not estimate returns ourselves.
          </p>
          <Note>
            These reports are general information, not investment advice or an offer of securities. Reported returns do not
            guarantee future results. Check the original sources before you decide.
          </Note>
        </div>
      </Section>
    </>
  );
}
