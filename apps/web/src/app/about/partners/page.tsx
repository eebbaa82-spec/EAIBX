import type { Metadata } from "next";
import { ButtonLink, Card, CardGrid, EmptyState, PageHero, Section, Tbc } from "@/components/ui";

const intro =
  "EABIX works with banks, development finance institutions, government agencies, universities, incubators and corporates who share our goal of a thriving private sector.";

export const metadata: Metadata = {
  title: "Partners · EABIX",
  description: "EABIX works with banks, DFIs, government agencies, universities, incubators and corporates who share our goal of a thriving private sector.",
};

const categories = [
  "Financial institutions",
  "Development partners",
  "Government and regulators",
  "Academic and research partners",
  "Ecosystem builders",
  "Technology partners",
];

export default function AboutPartnersPage() {
  return (
    <>
      <PageHero eyebrow="Partners" title="Stronger together" subhead={intro}>
        <ButtonLink href="/partners" variant="light">
          Become a partner
        </ButtonLink>
      </PageHero>
      <Section title="Partner categories">
        <CardGrid cols={3}>
          {categories.map((c) => (
            <Card key={c} title={c} />
          ))}
        </CardGrid>
      </Section>
      <Section tone="canvas">
        <EmptyState action={<ButtonLink href="/partners">Become a partner</ButtonLink>}>
          <Tbc>partner names, logos and one line each on the partnership, with written approval</Tbc>
        </EmptyState>
      </Section>
    </>
  );
}
