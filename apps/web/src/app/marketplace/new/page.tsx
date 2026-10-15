import type { Metadata } from "next";
import { ButtonLink, CtaBand, Note, PageHero, Section, Steps } from "@/components/ui";

export const metadata: Metadata = {
  title: "List your business · EABIX",
  description:
    "It is free to create a listing. Your identity stays private until you choose to share it.",
};

export default function NewListingPage() {
  return (
    <>
      <PageHero
        title="List your business on EABIX"
        subhead="It is free to create a listing. Your identity stays private until you choose to share it."
      >
        <ButtonLink href="/join" variant="light">
          List your business
        </ButtonLink>
      </PageHero>

      <Section title="How it works">
        <Steps
          steps={[
            { title: "Business basics" },
            { title: "Financials" },
            { title: "The opportunity" },
            { title: "Documents" },
            { title: "Review and publish" },
          ]}
        />
        <div className="mt-8">
          <Note>
            Our team reviews every listing within 5 working days. We may ask you for more information. You
            will get an email when your listing goes live.
          </Note>
        </div>
      </Section>

      <CtaBand
        title="Take the Business Health Check so your listing goes live with a grade."
      >
        <ButtonLink href="/join" variant="light">
          List your business
        </ButtonLink>
        <ButtonLink href="/diagnostics" variant="ghost" className="text-white">
          Start Health Check
        </ButtonLink>
      </CtaBand>
    </>
  );
}
