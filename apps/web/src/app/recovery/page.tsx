import type { Metadata } from "next";
import { ButtonLink, CtaBand, Note, PageHero, Section, Steps } from "@/components/ui";

export const metadata: Metadata = {
  title: "Business Recovery and Turnaround · Kenna Ventures",
  description:
    "Confidential help for Ethiopian businesses under pressure: diagnosis, turnaround plans, recovery capital and managed sales.",
};

const warningSigns = [
  "You are paying suppliers late",
  "Your bank is asking difficult questions",
  "You are using next month's income for this month's bills",
  "Key staff or customers are leaving",
  "You are not sure your business is still profitable",
];

export default function RecoveryPage() {
  return (
    <>
      <PageHero
        eyebrow="Business Recovery"
        title="Every business hits hard times. The best ones get help early."
        subhead="If sales have fallen, cash is tight or debts are piling up, Kenna Ventures can help you understand what went wrong and find the best way forward, confidentially."
      >
        <ButtonLink href="/contact" variant="light">
          Talk to a recovery advisor
        </ButtonLink>
        <ButtonLink href="/diagnostics" variant="light">
          Take the free EHIRA assessment
        </ButtonLink>
      </PageHero>

      <Section title="Is this you?">
        <ul className="grid gap-3 md:grid-cols-2">
          {warningSigns.map((s) => (
            <li key={s} className="flex gap-3 rounded-lg border border-line bg-white p-4 text-ink">
              <span aria-hidden className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full bg-gold-500" />
              {s}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="canvas" title="Your recovery path">
        <Steps
          steps={[
            { title: "Diagnose.", body: "Take the EHIRA assessment to see the real picture, without blame." },
            {
              title: "Plan.",
              body: "An accredited turnaround advisor builds a practical recovery plan with you: cost, cash, debt, operations and strategy.",
            },
            {
              title: "Fund the turnaround.",
              body: "Where the plan works, we introduce you to investors who specialize in recovery capital.",
            },
            {
              title: "Restructure or exit with dignity.",
              body: "If recovery is not possible, we help you restructure, merge or sell through a managed, confidential process that protects value for you, your staff and your creditors.",
            },
          ]}
        />
        <div className="mt-8 space-y-4">
          <Note>
            Everything you share stays between you and the advisors you choose. Your business is never named publicly
            without your written consent.
          </Note>
          <Note>
            Where formal insolvency or bankruptcy proceedings apply under Ethiopian law, we work alongside your lawyers and
            the appointed officials. Kenna Ventures does not replace legal process.
          </Note>
        </div>
      </Section>

      <Section title="Recovery opportunities for investors">
        <p className="max-w-3xl text-lg text-muted">
          Some of the best returns come from good businesses with fixable problems. Browse recovery opportunities and
          distressed assets, each with a diagnostic report and a clear reason for sale.
        </p>
        <div className="mt-6">
          <ButtonLink href="/marketplace">Browse recovery opportunities</ButtonLink>
        </div>
      </Section>

      <CtaBand title="Every business hits hard times. The best ones get help early.">
        <ButtonLink href="/contact" variant="light">
          Talk to a recovery advisor
        </ButtonLink>
        <ButtonLink href="/diagnostics" variant="ghost" className="text-white">
          Take the free EHIRA assessment
        </ButtonLink>
      </CtaBand>
    </>
  );
}
