import type { Metadata } from "next";
import { ButtonLink, CtaBand, EmptyState, Note, PageHero, Section, TagList } from "@/components/ui";

export const metadata: Metadata = {
  title: "Guides and Templates for Ethiopian Business",
  description:
    "Free guides, templates, sector reports and regulatory updates for founders and investors in Ethiopia.",
};

const contentTypes = [
  "Guides",
  "Templates and toolkits",
  "Sector reports",
  "Regulatory updates",
  "Case studies",
  "Webinars and recordings",
];

const featuredGuides = [
  "How to raise your first investment in Ethiopia: a step-by-step guide",
  "Selling your business: what it is worth and how to find the right buyer",
  "What investors look for in a data room",
  "Understanding the Ethiopian Securities Exchange and what it means for growing companies",
  "Business recovery: ten early warning signs and what to do about each",
  "Investing in Ethiopia from the diaspora: rules, routes and risks",
];

export default function KnowledgePage() {
  return (
    <>
      <PageHero
        title="Knowledge Hub"
        subhead="Guides, templates, sector reports and policy updates to help you make better business and investment decisions in Ethiopia."
      />

      <Section title="Browse by type">
        <TagList items={contentTypes} />
      </Section>

      <Section title="Sector investment reports" tone="canvas">
        <p className="max-w-3xl text-lg text-muted">
          Monthly reports on opportunities, published returns and incentives in each Ethiopian sector, sourced only from
          international institutions and the Ethiopian government.
        </p>
        <div className="mt-6">
          <ButtonLink href="/knowledge/sectors">Download sector reports</ButtonLink>
        </div>
      </Section>

      <Section title="Regulations and research">
        <p className="max-w-3xl text-lg text-muted">
          Plain-English summaries of National Bank of Ethiopia directives, finance and investment laws, incentives and World
          Bank research on Ethiopia, each linked to the original document.
        </p>
        <div className="mt-6">
          <ButtonLink href="/knowledge/regulations">Browse the library</ButtonLink>
        </div>
      </Section>

      <Section tone="canvas" title="Featured guides">
        <ul className="grid gap-4 md:grid-cols-2">
          {featuredGuides.map((g) => (
            <li key={g} className="flex flex-col rounded-xl border border-line bg-white p-6 shadow-sm">
              <span className="mb-2 w-fit rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-ink">Coming soon</span>
              <span className="font-semibold text-ink">{g}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Template library">
        <EmptyState action={<ButtonLink href="/join">Join free</ButtonLink>}>
          Free, editable templates reviewed by Ethiopian professionals. Download, adapt and use.
        </EmptyState>
        <div className="mt-4">
          <Note>Templates are a starting point, not legal advice.</Note>
        </div>
      </Section>

      <CtaBand title="Join free to download this template and get new resources every two weeks.">
        <ButtonLink href="/join" variant="light">
          Join free
        </ButtonLink>
      </CtaBand>
    </>
  );
}
