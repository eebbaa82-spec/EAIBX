import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, Container, DataTable, Faq, Note, PageHero, Section, Tbc } from "@/components/ui";

export const metadata: Metadata = {
  title: "EABIX Pricing · Plans for Businesses and Investors",
  description:
    "Start free. Upgrade for featured listings, verified Health Checks and full deal room access. Pay in Birr.",
};

const businessRows = [
  ["Tagline", "Get on the map", "Get in front of investors", "Get the deal done"],
  [
    "Price",
    "Free",
    <>
      <Tbc /> ETB / month
    </>,
    <>
      <Tbc /> ETB / month
    </>,
  ],
  ["Profile and listing", "Basic listing", "Featured listing", "Top placement and homepage feature"],
  ["Health Check", "Free self-assessment", "One verified Health Check a year", "Verified Health Check plus analyst call"],
  [
    "Investor contacts",
    <>
      <Tbc /> a month
    </>,
    <>
      <Tbc /> a month
    </>,
    "Unlimited",
  ],
  ["Data room", "5 documents", "Full data room", "Full data room with view analytics"],
  ["Deal Room eligibility", "No", "Yes", "Priority consideration"],
  ["Academy", "Free courses", "All courses", "All courses plus certificates"],
  ["Support", "Help Center", "Email support", "Dedicated relationship manager"],
  [
    "",
    <ButtonLink key="s" href="/join" variant="secondary">
      Join free
    </ButtonLink>,
    <ButtonLink key="g" href="/join">
      Choose Growth
    </ButtonLink>,
    <ButtonLink key="p" href="/join">
      Choose Premium
    </ButtonLink>,
  ],
];

const investorRows = [
  ["Tagline", "See what is out there", "Act on the best deals", "Run your pipeline on EABIX"],
  [
    "Price",
    "Free",
    <>
      <Tbc /> ETB / month
    </>,
    "Custom",
  ],
  ["Browse listings", "Teasers only", "Full listing details", "Full listing details"],
  ["Data room access", "No", "Yes, on owner approval", "Yes, on owner approval"],
  ["Deal Rooms", "Register interest", "Full participation", "Full participation plus private rooms"],
  ["Alerts", "Weekly digest", "Instant matched alerts", "Custom pipeline and API"],
  [
    "Team seats",
    "1",
    "1",
    <>
      Multiple <Tbc />
    </>,
  ],
  [
    "",
    <ButtonLink key="e" href="/join" variant="secondary">
      Join free
    </ButtonLink>,
    <ButtonLink key="i" href="/join">
      Choose Investor
    </ButtonLink>,
    <ButtonLink key="t" href="/contact">
      Talk to us
    </ButtonLink>,
  ],
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        title="Simple plans. Start free."
        subhead="Join EABIX at no cost, then upgrade when you are ready to reach more investors, buyers and experts. Pay in Birr with Chapa or Telebirr."
      >
        <ButtonLink href="#business-plans" variant="light">
          For businesses
        </ButtonLink>
        <ButtonLink href="#investor-plans" variant="light">
          For investors
        </ButtonLink>
      </PageHero>

      <div className="border-b border-line bg-white py-4">
        <Container>
          <p className="text-center text-sm text-muted">
            Billing: Monthly | Yearly (save <Tbc>%</Tbc>)
          </p>
        </Container>
      </div>

      <Section id="business-plans" title="Business plans">
        <DataTable head={["", "Starter", "Growth", "Premium"]} rows={businessRows} />
      </Section>

      <Section id="investor-plans" tone="canvas" title="Investor plans">
        <DataTable head={["", "Explorer", "Investor", "Institutional"]} rows={investorRows} />
      </Section>

      <Section
        id="services"
        title="Success fees and services"
        intro="Some services carry a one-off fee, always agreed in writing before work starts."
      >
        <ul className="space-y-3 text-muted">
          <li className="rounded-lg border border-line bg-white p-4">
            <strong className="text-ink">Verified Health Check (pay-as-you-go):</strong> <Tbc /> ETB
          </li>
          <li className="rounded-lg border border-line bg-white p-4">
            <strong className="text-ink">Success fee on completed transactions introduced through EABIX:</strong>{" "}
            <Tbc>rate and whether it applies</Tbc>
          </li>
          <li className="rounded-lg border border-line bg-white p-4">
            <strong className="text-ink">
              Program hosting for partner institutions, and Academy enterprise subscriptions for banks and MFIs (per seat,
              billed annually):
            </strong>{" "}
            Custom <Tbc />
          </li>
        </ul>
      </Section>

      <Section id="faq" tone="canvas" title="Pricing FAQ">
        <Faq
          items={[
            {
              q: "Can I cancel any time?",
              a: "Yes. Your plan stays active until the end of the period you paid for.",
            },
            {
              q: "Do you take a share of my business?",
              a: (
                <>
                  No. EABIX never takes equity in businesses on the platform. <Tbc>confirm</Tbc>
                </>
              ),
            },
            {
              q: "Is there a discount for startups in programs?",
              a: (
                <>
                  Yes. Program participants get <Tbc /> months of Growth free.
                </>
              ),
            },
            {
              q: "Can I pay from abroad?",
              a: (
                <>
                  Yes. Diaspora investors can pay by international card. <Tbc>confirm gateway</Tbc>
                </>
              ),
            },
          ]}
        />
        <div className="mt-8">
          <Note>
            Not sure which plan fits?{" "}
            <Link href="/contact" className="font-semibold text-brand-700 hover:underline">
              Talk to our team
            </Link>{" "}
            and we will help you choose.
          </Note>
        </div>
      </Section>
    </>
  );
}
