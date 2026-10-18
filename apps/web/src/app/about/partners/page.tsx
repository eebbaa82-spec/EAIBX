import type { Metadata } from "next";
import { ButtonLink, Card, CardGrid, EmptyState, PageHero, Section } from "@/components/ui";

const intro =
  "Kena Hub works with banks, development finance institutions, government agencies, universities, incubators and corporates who share our goal of a thriving private sector.";

export const metadata: Metadata = {
  title: "Partners · Kena Hub",
  description: "Kena Hub works with banks, DFIs, government agencies, universities, incubators and corporates who share our goal of a thriving private sector.",
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
          Partner announcements are coming soon. We are working with banks, MFIs, development partners and universities to bring their programs and services to Kena Hub.
        </EmptyState>
      </Section>
    </>
  );
}
