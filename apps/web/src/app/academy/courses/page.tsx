import type { Metadata } from "next";
import { ProCatalog } from "@/components/academy/CoursePages";
import { PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Online courses · Erudite Africa Center of Excellence",
  description: "Interactive online courses in four folders: Bank and MFI, Financial Management, Capital Market and General Courses, with Ethiopian examples, quizzes, a final exam and a certificate.",
};

export default function AcademyCourses() {
  return (
    <>
      <PageHero
        eyebrow="Erudite Africa Center of Excellence"
        title="Online courses"
        subhead="Interactive courses in four folders: Bank and MFI, Financial Management, Capital Market and General Courses, built on Ethiopian practice and the current laws and directives. Module 1 of every course is free for registered users; subscribers open everything, including the final exam and certificate."
      />
      <Section>
        <ProCatalog />
      </Section>
    </>
  );
}
