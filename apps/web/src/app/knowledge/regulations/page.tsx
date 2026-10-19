import type { Metadata } from "next";
import { ButtonLink, Note, PageHero, Section } from "@/components/ui";
import { getLibrary, libraryPdfHref } from "@/lib/library";
import { formatDate } from "@/lib/sectors";

export const metadata: Metadata = {
  title: "Regulations and Research · Ethiopia",
  description:
    "Plain-English summaries of National Bank of Ethiopia directives, finance and investment laws, incentives and World Bank research on Ethiopia, with links to every original document.",
};

const displayDate = (d: string) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? formatDate(d) : d);

export default function RegulationsPage() {
  const library = getLibrary();
  const latest = library.reduce((d, c) => (c.asOf > d ? c.asOf : d), "");
  return (
    <>
      <PageHero
        eyebrow="Knowledge Hub"
        title="Regulations and research"
        subhead="Short, plain-English summaries of the rules and research that shape investing in Ethiopia. Updated every month."
      >
        <ButtonLink href="/join" variant="light">
          Join free for full references
        </ButtonLink>
      </PageHero>
      <Section
        title="In this library"
        intro={`${latest ? `Last updated ${formatDate(latest)}. ` : ""}Summaries are open to everyone. Direct links to every original document, and the fully referenced PDF digests, are available to registered Erudite Connect members.`}
      >
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {library.map((c) => (
            <li key={c.slug} className="flex flex-col rounded-xl border border-line bg-white p-5 shadow-sm">
              <a href={`#${c.slug}`} className="font-semibold text-brand-700 hover:underline">
                {c.name}
              </a>
              <span className="mt-1 text-sm text-muted">{c.documents.length} documents</span>
              <a href={libraryPdfHref(c.slug)} download className="mt-3 text-sm font-semibold text-ink hover:underline">
                Download digest (PDF)
              </a>
            </li>
          ))}
        </ul>
      </Section>
      {library.map((c, i) => (
        <Section key={c.slug} id={c.slug} title={c.name} intro={c.intro} tone={i % 2 === 0 ? "canvas" : undefined}>
          <ul className="space-y-4">
            {c.documents.map((d) => (
              <li key={d.title + d.number + d.date} className="rounded-xl border border-line bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">{d.topic}</span>
                  <span className="rounded-full bg-gold-100 px-2 py-0.5 font-semibold text-ink">{d.status}</span>
                </div>
                <h3 className="mt-2 font-semibold text-ink">{d.title}</h3>
                <p className="mt-1 text-sm text-muted">
                  {[d.number, d.issuer, displayDate(d.date)].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-3 text-justify text-sm text-ink">{d.summary}</p>
                <p className="mt-2 text-justify text-sm text-muted">
                  <strong className="text-ink">Why it matters: </strong>
                  {d.relevance}
                </p>
                <p className="mt-3 text-sm font-semibold text-brand-700">
                  Link to the original document: available to members
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ))}
      <Section title="About these summaries">
        <div className="max-w-3xl">
          <Note>
            Summaries are written by Erudite Connect to help you find and understand official documents. They are not legal advice and
            do not replace the original text. Laws and directives are amended often, so always check the original document and
            take professional advice before you act.
          </Note>
        </div>
      </Section>
    </>
  );
}
