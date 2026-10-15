import type { Metadata } from "next";
import { ButtonLink, CtaBand, EmptyState, Note, PageHero, Section, Tbc, TagList } from "@/components/ui";
import { PreviewForm } from "@/components/forms";
import { CardAnatomy } from "@/components/group-b/Filters";

export const metadata: Metadata = {
  title: "Business Advisors in Ethiopia · EABIX",
  description:
    "Vetted valuers, lawyers, accountants and turnaround experts for Ethiopian deals. Request a quote today.",
};

const categories = [
  "Valuation and corporate finance",
  "Legal and company secretarial",
  "Audit, accounting and tax",
  "Turnaround and restructuring",
  "Credit and collections",
  "Due diligence",
  "Business plans and financial models",
  "HR and organizational development",
  "Marketing and market research",
  "Technology and digital",
];

export default function AdvisorsPage() {
  return (
    <>
      <PageHero
        title="Find the right expert to get the deal done"
        subhead="Vetted accountants, lawyers, valuers, turnaround specialists and transaction advisors who know Ethiopian business."
      >
        <ButtonLink href="#request-a-quote" variant="light">
          Request a quote
        </ButtonLink>
        <ButtonLink href="/join" variant="light">
          Join as an advisor
        </ButtonLink>
      </PageHero>

      <Section title="Categories">
        <TagList items={categories} />
        <div className="mt-8 space-y-6">
          <EmptyState>Vetted advisors will be listed here once the first profiles go live.</EmptyState>
          <CardAnatomy
            title="Each advisor card shows"
            fields={["Firm or name", "Specialties", "Languages", "Location", "Rating and reviews", "Typical fee range", "Request a quote"]}
          />
          <CardAnatomy
            title="Each advisor profile covers"
            fields={["About", "Services and indicative fees", "Credentials and licenses", "Sectors served", "Case highlights", "Reviews"]}
          />
        </div>
      </Section>

      <Section id="request-a-quote" tone="canvas" title="Request a quote">
        <div className="grid gap-8 lg:grid-cols-2">
          <PreviewForm
            fields={[
              { name: "need", label: "What do you need help with?", type: "textarea", required: true },
              { name: "timeline", label: "Your timeline", required: true },
              { name: "budget", label: "Budget range" },
              { name: "documents", label: "Attach documents (optional)", type: "file" },
            ]}
            submitLabel="Send request"
            confirmation="Your request has been sent. Most advisors reply within two working days. You can follow the conversation in your Messages."
          />
          <div>
            <Note>
              EABIX checks each advisor&apos;s licenses and references before listing. Engagements are agreed directly
              between you and the advisor. <Tbc>confirm whether EABIX takes a referral fee and disclose it here if so</Tbc>
            </Note>
          </div>
        </div>
      </Section>

      <CtaBand title="Offer your services to businesses and investors across Ethiopia.">
        <ButtonLink href="/join" variant="light">
          Join as an advisor
        </ButtonLink>
      </CtaBand>
    </>
  );
}
