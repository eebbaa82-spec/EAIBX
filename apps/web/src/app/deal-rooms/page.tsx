import type { Metadata } from "next";
import { ButtonLink, EmptyState, FeatureList, PageHero, Section, Steps } from "@/components/ui";
import { CardAnatomy } from "@/components/group-b/Filters";

export const metadata: Metadata = {
  title: "Curated Deal Rooms for Investors · Kena",
  description:
    "Themed showcases of verified, diagnosed Ethiopian businesses, with secure data rooms for due diligence.",
};

export default function DealRoomsPage() {
  return (
    <>
      <PageHero
        title="Curated deal rooms for serious investors"
        subhead="Each Kena Deal Room brings together a hand-picked group of verified, diagnosed businesses around a sector or theme, and opens them to qualified investors for a set period."
      >
        <ButtonLink href="/join" variant="light">
          Request access
        </ButtonLink>
        <ButtonLink href="#for-businesses" variant="light">
          Get your business into a Deal Room
        </ButtonLink>
      </PageHero>

      <Section title="How Deal Rooms work">
        <Steps
          steps={[
            {
              title: "Curation.",
              body: "Our analysts shortlist businesses with strong EHIRA grades and complete documentation.",
            },
            {
              title: "Preparation.",
              body: "Shortlisted businesses get coaching on their pitch, financial model and data room.",
            },
            {
              title: "Showcase.",
              body: "Verified investors review profiles, join live pitch sessions and ask questions in a moderated Q&A.",
            },
            {
              title: "Due diligence.",
              body: "Interested investors get permissioned access to each business's private data room.",
            },
            { title: "Follow-through.", body: "We support term sheet discussions and track outcomes for every room." },
          ]}
        />
      </Section>

      <Section tone="canvas" title="Upcoming and open rooms">
        <div className="space-y-6">
          <EmptyState action={<ButtonLink href="/join" variant="secondary">Register interest</ButtonLink>}>
            The first deal rooms open after launch. Register your interest and we will tell you when a room matches what you are looking for.
          </EmptyState>
          <CardAnatomy
            title="Each room card shows"
            fields={[
              "Room name",
              "Theme",
              "Number of businesses",
              "Ticket range",
              "Open dates",
              "Status",
              "Request access or Register interest",
            ]}
          />
        </div>
      </Section>

      <Section id="for-businesses" eyebrow="For businesses" title="Get your business into a Deal Room">
        <p className="max-w-3xl text-lg text-muted">
          Deal Rooms are selective. To be considered, complete your listing, achieve a verified EHIRA grade of{" "}
          C or better, and upload the core documents in your data room.
        </p>
        <div className="mt-6">
          <ButtonLink href="/join">Check my eligibility</ButtonLink>
        </div>
      </Section>

      <Section
        tone="canvas"
        title="A secure data room for every deal"
        intro="Every business on Kena gets its own private data room. Share financial statements, legal documents and contracts with the investors you approve, and nobody else."
      >
        <FeatureList
          items={[
            { title: "You control access.", body: "Approve investors one by one and revoke access at any time." },
            { title: "Know who looked.", body: "See which documents each investor viewed and when." },
            {
              title: "Protected documents.",
              body: "Files are watermarked with the viewer's name and can be set to view-only.",
            },
            { title: "Organized Q&A.", body: "Questions and answers are logged in one place, so nothing is lost." },
            {
              title: "Standard checklist.",
              body: "A due diligence checklist built for Ethiopian businesses shows what investors will ask for.",
            },
          ]}
        />
      </Section>
    </>
  );
}
