import type { Metadata } from "next";
import { LoanCalculator } from "@/components/tools/LoanCalculator";
import { ButtonLink, CtaBand, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Loan Calculator: How Much Can I Borrow? · Erudite Africa Connect",
  description:
    "Work out the most you can borrow from what you can afford to pay, or your installments for a given loan, with monthly, quarterly, semi-annual or annual repayments.",
};

export default function LoanCalculatorPage() {
  return (
    <>
      <PageHero
        title="Loan calculator"
        subhead="Tell us what you can afford to pay and for how long, and see the most you could borrow. Or enter a loan amount to see your installments. Monthly, quarterly, semi-annual or annual repayments."
      />
      <Section title="Calculate">
        <LoanCalculator />
      </Section>
      <CtaBand
        title="Ready to approach a lender?"
        body="The Credit Management Center helps you prepare your file and manage your bank and MFI relationships."
      >
        <ButtonLink href="/credit-center" variant="light">
          Visit the Credit Management Center
        </ButtonLink>
      </CtaBand>
    </>
  );
}
