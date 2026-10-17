import type { Metadata } from "next";
import { ReadinessQuiz } from "@/components/tools/ReadinessQuiz";
import { ButtonLink, CtaBand, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Investment Readiness Quiz · EABIX",
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
      <CtaBand title="Want an independent view?" body="The Business Health Check grades your business from A to E across finance, operations, market, people and governance.">
        <ButtonLink href="/diagnostics" variant="light">
          About the Health Check
        </ButtonLink>
      </CtaBand>
    </>
  );
}
