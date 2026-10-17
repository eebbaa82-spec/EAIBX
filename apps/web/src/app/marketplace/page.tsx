import type { Metadata } from "next";
import { ButtonLink, DataTable, EmptyState, Note, PageHero, Section } from "@/components/ui";
import { CardAnatomy, FilterGroup, FilterPanel, StaticTabs } from "@/components/group-b/Filters";

export const metadata: Metadata = {
  title: "Businesses for Sale and Investment in Ethiopia",
  description:
    "Browse verified Ethiopian businesses raising capital or for sale, each with an independent A to E health grade.",
};

const listingTypes = [
  "All",
  "Raising investment",
  "For sale",
  "Seeking partners",
  "Recovery opportunities",
  "Franchises and licenses",
];

const sectors = [
  "Agriculture and agro-processing",
  "Manufacturing",
  "Construction and real estate",
  "ICT and fintech",
  "Health and pharma",
  "Education",
  "Hospitality and tourism",
  "Trade and distribution",
  "Energy",
  "Transport and logistics",
  "Textiles and leather",
  "Other",
];

const regions = [
  "Addis Ababa",
  "Dire Dawa",
  "Oromia",
  "Amhara",
  "Tigray",
  "Sidama",
  "Central Ethiopia",
  "South Ethiopia",
  "South West Ethiopia",
  "Afar",
  "Somali",
  "Benishangul-Gumuz",
  "Gambela",
  "Harari",
  "Outside Ethiopia",
];

const sections = [
  ["Business overview", "In three or four sentences, what does your business do, for whom, and why does it win?"],
  ["Products and services", "List your main products or services and the share of revenue each brings."],
  ["Market and customers", "Who buys from you, how many customers you have, and how the market is growing."],
  ["Performance highlights", "Revenue trend, key contracts, growth rate, awards. Numbers beat adjectives."],
  [
    "Management team",
    "Who runs the business day to day and what they bring. Names stay hidden until you approve a contact.",
  ],
  ["The opportunity", "What you are offering, how much, and how the funds or proceeds will be used."],
  ["Reason for raising or selling", "Be honest. Investors trust clear reasons."],
  ["Assets included", "Land, buildings, equipment, licenses, brands or IP that come with the deal."],
];

export default function MarketplacePage() {
  return (
    <>
      <PageHero
        title="Opportunities Marketplace"
        subhead="Verified Ethiopian businesses raising capital, seeking partners or open to acquisition. Every listing carries an independent health grade."
      >
        <ButtonLink href="/marketplace/new" variant="light">
          List your business
        </ButtonLink>
        <ButtonLink href="/join" variant="light">
          Join free
        </ButtonLink>
      </PageHero>

      <Section>
        <StaticTabs label="Listing type" items={listingTypes} />
        <div className="mt-8 grid gap-8 lg:grid-cols-[20rem_1fr]">
          <FilterPanel>
            <FilterGroup title="Sector" options={sectors} />
            <FilterGroup title="Region" options={regions} />
            <FilterGroup title="Stage" options={["Idea", "Early stage", "Growth", "Established", "Distressed"]} />
            <FilterGroup
              title="Amount sought (ETB)"
              helper="Enter the total the business wants to raise or its asking price."
            />
            <FilterGroup
              title="Health grade"
              options={["A", "B", "C", "D", "E"]}
              helper="Grades come from EHIRA, the EABIX Enterprise Health & Investment Readiness Assessment."
            />
            <FilterGroup
              title="Deal type"
              options={["Equity", "Debt", "Convertible", "Full sale", "Partial sale", "Asset sale", "Joint venture"]}
            />
            <FilterGroup title="Women-led" options={["Women-led"]} />
            <FilterGroup title="Program alumni" options={["Program alumni"]} />
          </FilterPanel>

          <div className="space-y-6">
            <div>
              <h2 className="sr-only">Opportunities</h2>
              <p className="text-sm text-muted">
                <span className="font-semibold text-ink">Sort:</span> Most recent · Best match for me · Highest grade ·
                Amount, low to high
              </p>
            </div>
            <EmptyState action={<ButtonLink href="/join" variant="secondary">Save search</ButtonLink>}>
              No opportunities match these filters yet. Save this search and we will alert you when one does.
            </EmptyState>
            <CardAnatomy
              title="Each listing card shows"
              fields={[
                "Anonymized title",
                "Sector",
                "Region",
                "Year founded",
                "Annual revenue range",
                "Amount sought in ETB",
                "Grade badge",
                "Save",
                "View details",
              ]}
            />
            <div className="rounded-xl border border-line bg-white p-6">
              <p className="text-ink">
                Create a free account to see all opportunities, save searches and contact businesses.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <ButtonLink href="/join">Join free</ButtonLink>
                <ButtonLink href="/login" variant="ghost">
                  Log in
                </ButtonLink>
              </div>
            </div>
            <aside className="rounded-xl bg-brand-50 p-6" aria-label="For business owners">
              <p className="font-semibold text-brand-900">
                Is your business here? List it free and reach verified investors.
              </p>
              <div className="mt-4">
                <ButtonLink href="/marketplace/new">List your business</ButtonLink>
              </div>
            </aside>
          </div>
        </div>
      </Section>

      <Section
        tone="canvas"
        title="What every listing shows"
      >
        <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
          <div className="rounded-xl border border-line bg-white p-6">
            <h3 className="font-semibold text-ink">Key facts</h3>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {[
                "Sector",
                "Location",
                "Established",
                "Legal form",
                "Employees",
                "Annual revenue (range)",
                "EBITDA margin (range)",
                "Deal type",
                "Amount sought",
                "Use of funds",
              ].map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <h3 className="mt-6 font-semibold text-ink">Health summary</h3>
            <p className="mt-1 text-sm text-muted">
              Overall grade A to E · Strongest area · Area to watch · Request the full report (requires owner approval)
            </p>
          </div>
          <div>
            <DataTable head={["Section", "What the owner tells you"]} rows={sections} />
            <p className="mt-6 text-muted">
              Interested in an opportunity? Send an introduction. The owner sees your verified profile and decides whether
              to open their deal room to you.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <Note>
            Information on this page is provided by the business owner and summarized by EABIX. EABIX verifies identity and
            reviews diagnostics but does not guarantee accuracy. Always carry out your own due diligence and take
            professional advice.
          </Note>
        </div>
      </Section>
    </>
  );
}
