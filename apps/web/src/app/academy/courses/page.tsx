import type { Metadata } from "next";
import { ProCatalog } from "@/components/academy/CoursePages";
import { PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Online courses for bank and MFI staff · Investopia Academy",
  description: "Interactive online courses in credit analysis, project appraisal and banking operations, with Ethiopian examples, NBE rules, quizzes, a final exam and a certificate.",
};

export default function AcademyCourses() {
  return (
    <>
      <PageHero
        eyebrow="Investopia Academy"
        title="Online courses for bank and MFI staff"
        subhead="Interactive courses in credit, project appraisal and banking operations, built on Ethiopian bank practice and NBE directives. Module 1 of every course is free for registered users; subscribers open everything, including the final exam and certificate."
      />
      <Section>
        <ProCatalog />
      </Section>
    </>
  );
}
