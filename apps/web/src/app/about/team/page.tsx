import type { Metadata } from "next";
import { EmptyState, Note, PageHero, Section, Tbc } from "@/components/ui";

const intro =
  "Our team brings together investment professionals, turnaround specialists, technologists and educators who share one belief: Ethiopian business deserves world-class infrastructure.";

export const metadata: Metadata = {
  title: "Our Team · EABIX",
  description: "Investment professionals, turnaround specialists, technologists and educators building world-class infrastructure for Ethiopian business.",
};

export default function TeamPage() {
  return (
    <>
      <PageHero eyebrow="Our team" title="The people behind EABIX" subhead={intro} />
      <Section>
        <EmptyState>
          <Tbc>leadership team, board and advisory council names, titles and approved bios</Tbc>
        </EmptyState>
        <div className="mt-6">
          <Note>Each profile card shows: Photo · Name · Title · One-line bio · LinkedIn</Note>
        </div>
      </Section>
    </>
  );
}
