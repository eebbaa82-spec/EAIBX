import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, FeatureList, Note, PageHero, Section, Steps } from "@/components/ui";
import { academy } from "@/lib/site";

export const metadata: Metadata = {
  title: "Credit Management Center · Erudite Africa Connect",
  description:
    "Manage bank and MFI credit relationships, and give lenders faster, consent-based client due diligence. Built for Ethiopia.",
};

export default function CreditCenterPage() {
  return (
    <>
      <PageHero
        eyebrow="Credit Management Center"
        title="Better credit relationships between businesses and lenders."
        subhead="The Erudite Africa Connect Credit Management Center of Excellence helps businesses manage their relationships with banks and microfinance institutions (MFIs), and helps banks and MFIs carry out faster, better-documented client due diligence."
      >
        <ButtonLink href="#for-businesses" variant="light">
          I&apos;m a business
        </ButtonLink>
        <ButtonLink href="#for-lenders" variant="light">
          I&apos;m a bank or MFI
        </ButtonLink>
      </PageHero>

      <Section
        id="for-businesses"
        eyebrow="For businesses"
        title="Be the borrower every lender wants."
        intro="Getting credit is only the start. Keeping a strong relationship with your bank or MFI means clear records, on-time reporting and early, honest conversations. Erudite Africa Connect gives you the tools to do all three."
      >
        <FeatureList
          items={[
            {
              title: "Credit profile.",
              body: "Keep your financial statements, licenses, collateral documents, existing facilities and repayment record in one secure profile, ready to share with any lender you choose.",
            },
            {
              title: "Facility tracker.",
              body: "See every loan, overdraft and guarantee in one place, with repayment dates, covenants and renewal deadlines, and get reminders before they are due.",
            },
            {
              title: "Lender matching.",
              body: "Find banks and MFIs whose products fit your size, sector and need, from working capital and term loans to trade finance and leasing.",
            },
            {
              title: "Relationship support.",
              body: "Prepare for credit committee questions, facility renewals and restructuring requests with guides, templates and a credit advisor when you need one.",
            },
            {
              title: "Early warning.",
              body: (
                <>
                  If repayments or covenants come under pressure, Erudite Africa Connect flags it early and connects you with{" "}
                  <Link href="/recovery" className="text-brand-700 underline-offset-4 hover:underline">
                    Business Recovery
                  </Link>{" "}
                  support before the problem grows.
                </>
              ),
            },
          ]}
        />
        <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Free tool</p>
          <h3 className="mt-1 text-xl font-bold text-ink">Borrower profile builder</h3>
          <p className="mt-2 max-w-2xl text-muted">
            Upload your company profile, answer a few questions about your loan, finances and collateral, and get a lender-ready profile, a
            readiness check and the document checklist for your loan type, from working capital to project and lease financing.
          </p>
          <div className="mt-5">
            <ButtonLink href="/credit-center/profile-builder">Build my borrower profile</ButtonLink>
          </div>
        </div>
      </Section>

      <Section
        id="for-lenders"
        tone="canvas"
        eyebrow="For banks and MFIs"
        title="Faster due diligence. Healthier portfolios."
        intro="Erudite Africa Connect gives credit teams a secure, consent-based way to collect, review and verify client information, and to follow borrowers after disbursement."
      >
        <FeatureList
          items={[
            {
              title: "Client due diligence workspace.",
              body: (
                <>
                  Request, receive and review know-your-customer (KYC) and know-your-business (KYB) documents through a
                  secure data room, with a standard checklist your team can adapt to its own policies and regulatory
                  requirements.
                </>
              ),
            },
            {
              title: "Verified business data.",
              body: "With the client's consent, see their EHIRA grade, diagnostic report and financial summaries, reviewed by Erudite Africa Connect analysts.",
            },
            {
              title: "Structured appraisal support.",
              body: "Receive applications in a consistent format, with financial statements spread into standard ratios, so analysts spend less time on data entry and more on judgment.",
            },
            {
              title: "Follow-up and monitoring.",
              body: "Track covenants, document expiry dates, site visits and repayment behavior for connected borrowers, with early warning alerts.",
            },
            {
              title: "Pre-screened deal flow.",
              body: "Receive referrals of businesses from the Erudite Africa Connect marketplace and programs that match your lending criteria.",
            },
            {
              title: "Staff training and certification.",
              body: (
                <>
                  Train and certify your credit teams at our sister service, the{" "}
                  <a href={`${academy.url}/academy/`} className="text-brand-700 underline-offset-4 hover:underline">
                    Erudite Africa Center of Excellence
                  </a>
                  .
                </>
              ),
            },
          ]}
        />
        <div className="mt-8 rounded-2xl border border-brand-200 bg-white p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">For loan officers and credit analysts</p>
          <h3 className="mt-1 text-xl font-bold text-ink">Credit analysis workspace</h3>
          <p className="mt-2 max-w-2xl text-muted">
            Spread up to five periods of financial statements in the standard financial analysis form and get the totals, trend and analytical ratios at once. Add the loan
            application details, sector and regional context from official sources and your own findings and documents, and print a credit analysis report in the loan
            application annex format.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/credit-center/credit-analysis">Open the workspace</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Request a demo for your institution
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section title="How it works">
        <Steps
          steps={[
            { title: "The business builds its credit profile", body: "and completes the EHIRA assessment." },
            { title: "The business chooses which lenders", body: "may see its profile." },
            { title: "The lender reviews and requests", body: "any further documents through the secure workspace." },
            { title: "Both sides track the facility", body: "after disbursement, with shared reminders and early warnings." },
          ]}
        />
        <div className="mt-8 space-y-4">
          <Note>
            Businesses decide which lenders see their information. Lenders see only what the business shares, and every
            access is logged.
          </Note>
          <Note>
            Erudite Africa Connect is not a lender or a credit reference bureau. Every credit decision is made by the bank or MFI under its
            own policies and the applicable National Bank of Ethiopia directives.
          </Note>
        </div>
      </Section>
    </>
  );
}
