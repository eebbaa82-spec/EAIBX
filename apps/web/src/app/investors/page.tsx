import type { Metadata } from "next";
import { ButtonLink, CtaBand, EmptyState, PageHero, Section } from "@/components/ui";
import { CardAnatomy, FilterGroup, FilterPanel } from "@/components/group-b/Filters";

export const metadata: Metadata = {
  title: "Investors in Ethiopian Businesses · Kena",
  description: "Find angel investors, funds, banks and diaspora investors backing Ethiopian SMEs and startups.",
};

export default function InvestorsPage() {
  return (
    <>
      <PageHero
        title="Meet the investors backing Ethiopian business"
        subhead="Angel investors, venture and private equity funds, banks, family offices, corporates and diaspora investors, all verified by Kena."
      >
        <ButtonLink href="/join" variant="light">
          Join free
        </ButtonLink>
        <ButtonLink href="/investors/verify" variant="light">
          Become a verified investor
        </ButtonLink>
      </PageHero>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
          <FilterPanel>
            <FilterGroup title="Investor type" />
            <FilterGroup title="Sectors" />
            <FilterGroup title="Ticket size" options={["ETB", "USD"]} />
            <FilterGroup title="Stage" />
            <FilterGroup title="Deal type" />
            <FilterGroup title="Based in" options={["Ethiopia", "Abroad"]} />
          </FilterPanel>
          <div className="space-y-6">
            <h2 className="sr-only">Investors</h2>
            <EmptyState action={<ButtonLink href="/join" variant="secondary">Join free</ButtonLink>}>
              Join free to see investor profiles and send your opportunity to the right people.
            </EmptyState>
            <CardAnatomy
              title="Each investor card shows"
              fields={[
                "Name or anonymized label",
                "Type",
                "Sectors",
                "Ticket range",
                "Deals done on Kena",
                "Verified badge",
                "View profile",
              ]}
            />
            <CardAnatomy
              title="Each investor profile covers"
              fields={[
                "About us",
                "Investment focus (sectors, stages, regions)",
                "Ticket size",
                "What we bring beyond capital",
                "Portfolio highlights",
                "How to approach us",
              ]}
            />
          </div>
        </div>
      </Section>

      <CtaBand title="Want businesses to find you?" body="Create a free investor profile.">
        <ButtonLink href="/join" variant="light">
          Join as an investor
        </ButtonLink>
      </CtaBand>
    </>
  );
}
