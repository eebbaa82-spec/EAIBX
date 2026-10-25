import type { Metadata } from "next";
import { CreditAnalysis } from "@/components/tools/CreditAnalysis";
import { PageHero, Section } from "@/components/ui";
import { getAnalysisContext } from "@/lib/credit/context";

export const metadata: Metadata = {
  title: "Credit Analysis Workspace · Credit Management Center · Kenna Ventures",
  description:
    "For loan officers and credit analysts: spread five periods of financial statements, get the ratios and trends, add sector and regional context from official sources, and print a credit analysis report in the loan application annex format.",
};

const templateHref = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/credit-center/templates/Kenna-Financial-Analysis-Template.xlsx`;

export default function CreditAnalysisPage() {
  return (
    <>
      <div className="print:hidden">
        <PageHero
          eyebrow="Credit Management Center · For loan officers and credit analysts"
          title="Credit analysis workspace"
          subhead="Enter the borrower's figures in the financial analysis form and get the totals, trends and ratios at once. Add the loan application details, choose sector and regional context from official sources, add anything you know, and print a credit analysis report in the annex format. Your case stays on your device."
        />
      </div>
      <Section>
        <CreditAnalysis ctx={getAnalysisContext()} templateHref={templateHref} />
      </Section>
    </>
  );
}
