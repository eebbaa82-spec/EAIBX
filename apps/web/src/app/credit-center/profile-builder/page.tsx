import type { Metadata } from "next";
import { ProfileBuilder } from "@/components/tools/ProfileBuilder";
import { ButtonLink, CtaBand, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Borrower Profile Builder · Credit Management Center · Kenna Ventures",
  description:
    "Build a lender-ready borrower profile in steps: upload your company profile, describe your loan, finances and collateral, and get a readiness check and the document checklist for your loan type.",
};

export default function ProfileBuilderPage() {
  return (
    <>
      <div className="print:hidden">
        <PageHero
          eyebrow="Credit Management Center"
          title="Borrower profile builder"
          subhead="Prepare the profile a bank or MFI will ask for: who you are, what you need, your finances, banking record and collateral. Get a readiness check, the exact documents for your loan type, and a bank-ready PDF with your application letter once your business identity is verified. Your profile answers stay on your device."
        />
      </div>
      <Section>
        <ProfileBuilder />
      </Section>
      <div className="print:hidden">
        <CtaBand
          title="Want a second pair of eyes before you apply?"
          body="Kenna Ventures credit advisors can review your profile and help you prepare for the lender's questions."
        >
          <ButtonLink href="/contact" variant="light">
            Talk to a credit advisor
          </ButtonLink>
        </CtaBand>
      </div>
    </>
  );
}
