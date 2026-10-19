import type { Metadata } from "next";
import { ButtonLink, Note, PageHero, Section, TagList } from "@/components/ui";

export const metadata: Metadata = {
  title: "Become a verified investor · Erudite Connect",
  description:
    "Verification protects everyone. Verified investors get priority access to curated deal rooms on Erudite Connect.",
};

export default function InvestorVerifyPage() {
  return (
    <>
      <PageHero
        title="Become a verified investor"
        subhead="Verification protects everyone. Businesses share sensitive information only with investors they can trust, and verified investors get priority access to curated deal rooms."
      >
        <ButtonLink href="/join" variant="light">
          Start verification
        </ButtonLink>
      </PageHero>

      <Section title="What we check">
        <TagList
          items={[
            "Identity (ID or passport)",
            "Organization registration, if investing through a company or fund",
            "Source of funds declaration",
            "Investment experience and mandate",
          ]}
        />
        <div className="mt-8">
          <Note>
            Most verifications are completed within 10 working days.
          </Note>
        </div>
      </Section>

    </>
  );
}
