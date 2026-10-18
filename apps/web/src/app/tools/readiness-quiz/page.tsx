import type { Metadata } from "next";
import { ReadinessQuiz } from "@/components/tools/ReadinessQuiz";
import { ButtonLink, CtaBand, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Investment Readiness Quiz · Kena Hub",
  description: "Ten questions that tell you how close you are to being investor-ready, with next steps for every gap.",
};

export default function ReadinessQuizPage() {
  return (
    <>
      <PageHero
        title="Investment readiness quiz"
        subhead="Ten questions that show how close you are to being ready for investors, with a clear next step for every gap."
      />
      <Section title="Answer honestly">
        <ReadinessQuiz />
      </Section>
      <CtaBand title="Want an independent view?" body="EHIRA, the Enterprise Health & Investment Readiness Assessment, grades your business from A to E across eight dimensions, from finance to investment readiness.">
        <ButtonLink href="/diagnostics" variant="light">
          About EHIRA
        </ButtonLink>
      </CtaBand>
    </>
  );
}
