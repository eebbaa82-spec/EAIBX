import type { Metadata } from "next";
import { Card, CardGrid, EmptyState, PageHero, Section } from "@/components/ui";

const intro =
  "We are a small team with a big mandate. If you want your work to move capital, create jobs and give businesses a second chance, we would like to hear from you.";

export const metadata: Metadata = {
  title: "Careers · EABIX",
  description: "We are a small team with a big mandate. Help move capital, create jobs and give Ethiopian businesses a second chance.",
};

export default function CareersPage() {
  return (
    <>
      <PageHero eyebrow="Careers" title="Help build Ethiopia's business future" subhead={intro} />
      <Section title="Why join us">
        <CardGrid cols={4}>
          <Card title="Meaningful work with visible impact" />
          <Card title="Learning from investors, founders and experts every day" />
          <Card title="Flexible, respectful culture" />
          <Card title="Room to grow your skills and career" />
        </CardGrid>
      </Section>
      <Section title="Open roles" tone="canvas">
        <EmptyState>
          No open roles right now. Send your resume to{" "}
          <a href="mailto:career@ebba.et" className="text-brand-700 hover:underline">
            career@ebba.et
          </a>{" "}
          and we will keep you in mind.
        </EmptyState>
      </Section>
    </>
  );
}
