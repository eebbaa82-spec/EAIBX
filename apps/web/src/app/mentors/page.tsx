import type { Metadata } from "next";
import { ButtonLink, CtaBand, EmptyState, Note, PageHero, Section, Steps } from "@/components/ui";
import { PreviewForm } from "@/components/forms";
import { CardAnatomy, FilterGroup, FilterPanel } from "@/components/group-b/Filters";

export const metadata: Metadata = {
  title: "Find a Business Mentor in Ethiopia · Investopia",
  description: "Book free sessions with experienced founders, executives and investors in Amharic or English.",
};

export default function MentorsPage() {
  return (
    <>
      <PageHero
        title="Learn from people who have done it"
        subhead="Book time with experienced founders, executives, investors and specialists who volunteer to help Ethiopian businesses grow."
      >
        <ButtonLink href="#request-a-session" variant="light">
          Request a session
        </ButtonLink>
        <ButtonLink href="#become-a-mentor" variant="light">
          Become a mentor
        </ButtonLink>
      </PageHero>

      <Section title="Find a mentor">
        <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
          <FilterPanel>
            <FilterGroup title="Expertise" />
            <FilterGroup title="Sector" />
            <FilterGroup title="Language" options={["Amharic", "English", "Afaan Oromo", "Tigrinya", "Other"]} />
            <FilterGroup title="Availability" />
            <FilterGroup title="Format" options={["Online", "In person"]} />
          </FilterPanel>
          <div className="space-y-6">
            <EmptyState>Mentor profiles will be listed here once the first mentors join.</EmptyState>
            <CardAnatomy
              title="Each mentor card shows"
              fields={["Photo", "Name", "Role and organization", "Expertise tags", "Sessions given", "Rating", "Request a session"]}
            />
          </div>
        </div>
      </Section>

      <Section tone="canvas" title="How mentoring works">
        <Steps
          steps={[
            { title: "Find a mentor.", body: "Search by the challenge you face, not just the title they hold." },
            { title: "Send a short request.", body: "Say what you want to achieve in one session." },
            { title: "Meet.", body: "Use the built-in video call or meet in person." },
            { title: "Follow up.", body: "Record what you agreed and rate the session so we can improve matches." },
          ]}
        />
      </Section>

      <Section id="request-a-session" title="Request a session">
        <div className="grid gap-8 lg:grid-cols-2">
          <PreviewForm
            fields={[
              { name: "help", label: "What would you like help with?", type: "textarea", required: true },
              { name: "tried", label: "What have you already tried?", type: "textarea", required: true },
              { name: "dates", label: "Preferred dates", required: true },
            ]}
            submitLabel="Send request"
            confirmation="Your request has been sent."
          />
          <div>
            <Note>
              Mentors give their time for free and never ask for payment, equity or confidential information in return.
              Report any concern to <a href="mailto:contact@ebba.et" className="text-brand-700 hover:underline">contact@ebba.et</a>.
            </Note>
          </div>
        </div>
      </Section>

      <div id="become-a-mentor">
        <CtaBand
          title="You have built something. Help someone else do the same."
          body="Give as little as two hours a month."
        >
          <ButtonLink href="/join" variant="light">
            Become a mentor
          </ButtonLink>
        </CtaBand>
      </div>
    </>
  );
}
