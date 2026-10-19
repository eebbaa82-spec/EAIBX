import type { Metadata } from "next";
import { ButtonLink, Card, CtaBand, EmptyState, PageHero, Section, TagList } from "@/components/ui";

export const metadata: Metadata = {
  title: "Business Events and Funding Calls in Ethiopia",
  description: "Pitch nights, investor forums, grants and competitions for Ethiopian businesses in one calendar.",
};

export default function EventsPage() {
  return (
    <>
      <PageHero
        title="Events and opportunities"
        subhead="Pitch nights, investor forums, workshops, grants, tenders and competitions for Ethiopian businesses, in one calendar."
      />

      <Section title="Signature event" tone="canvas">
        <Card
          title="Investopia Investment Forum"
        >
          Our flagship gathering of founders, investors, lenders and policymakers, featuring live deal room pitches and sector
          panels. The date of the first forum is announced soon.
        </Card>
      </Section>

      <Section title="Calendar">
        <div className="mb-6">
          <TagList items={["Events", "Funding calls and grants", "Competitions and awards", "Tenders and partnerships"]} />
        </div>
        <EmptyState action={<ButtonLink href="/join">Submit an opportunity</ButtonLink>}>
          Events and opportunities will appear here once they are listed on Investopia.
        </EmptyState>
      </Section>

      <CtaBand title="Running an event or funding call for Ethiopian businesses?" body="List it on Investopia free.">
        <ButtonLink href="/join" variant="light">
          Submit an opportunity
        </ButtonLink>
      </CtaBand>
    </>
  );
}
