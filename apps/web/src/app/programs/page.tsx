import type { Metadata } from "next";
import { ButtonLink, Card, CardGrid, EmptyState, PageHero, Section } from "@/components/ui";
import { CardAnatomy, FilterGroup, FilterPanel } from "@/components/group-b/Filters";

export const metadata: Metadata = {
  title: "Incubators and Accelerators in Ethiopia",
  description: "Apply to incubation, acceleration and competition programs for Ethiopian founders, all on Erudite Connect.",
};

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        title="Programs that turn ideas into investable businesses"
        subhead="Apply to incubators, accelerators, competitions and fellowships run on Erudite Connect by leading Ethiopian and international organizations."
      >
        <ButtonLink href="/join" variant="light">
          Get notified
        </ButtonLink>
      </PageHero>

      <Section title="Our flagship programs">
        <CardGrid cols={2}>
          <Card
            title="Erudite Connect Launchpad"
            footer={<ButtonLink href="/join" variant="secondary">Get notified</ButtonLink>}
          >
            Our own incubation program for early-stage Ethiopian founders. Validate your idea, build your first financial
            model, meet mentors every week and pitch to investors on Demo Day. Dates for the first cohort are announced soon.
          </Card>
          <Card
            title="Erudite Connect Scale"
            footer={<ButtonLink href="/join" variant="secondary">Get notified</ButtonLink>}
          >
            An acceleration program for businesses with revenue that are ready to grow. Sharpen strategy, fix systems, get
            investor-ready and enter a curated deal room. Dates for the first cohort are announced soon.
          </Card>
        </CardGrid>
      </Section>

      <Section tone="canvas" title="All programs">
        <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
          <FilterPanel>
            <FilterGroup title="Status" options={["Open", "Closing soon", "Upcoming", "Closed"]} />
            <FilterGroup title="Program type" />
            <FilterGroup title="Sector" />
            <FilterGroup title="Stage" />
            <FilterGroup title="Women-focused" options={["Women-focused"]} />
            <FilterGroup title="Region" />
            <FilterGroup title="Format" options={["Online", "In person"]} />
          </FilterPanel>
          <div className="space-y-6">
            <EmptyState action={<ButtonLink href="/join" variant="secondary">Notify me</ButtonLink>}>
              No programs match your filters right now. Turn on alerts and we will tell you when a new one opens.
            </EmptyState>
            <CardAnatomy
              title="Each program card shows"
              fields={[
                "Program name",
                "Organizer",
                "Type",
                "Duration",
                "Benefits (funding, mentoring, workspace)",
                "Deadline",
                "Apply now or Get notified",
              ]}
            />
            <CardAnatomy
              title="Each program page covers"
              fields={[
                "About the program",
                "Who should apply",
                "What you get",
                "Timeline (Applications open, Deadline, Selection, Kick-off, Demo Day)",
                "Selection criteria",
                "FAQs",
                "About the organizer",
              ]}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
