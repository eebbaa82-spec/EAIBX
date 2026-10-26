import type { Metadata } from "next";
import { ButtonLink, CtaBand, Faq, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Erudite Africa Connect FAQ · Answers for Businesses and Investors",
  description:
    "Answers to common questions about listings, EHIRA assessments, deal rooms, fees and investor verification.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero title="Frequently asked questions" />

      <Section id="general" title="General">
        <Faq
          items={[
            {
              q: "What is Erudite Africa Connect?",
              a: "Erudite Africa Connect, Erudite Africa's business and investment platform, is an online platform that connects Ethiopian entrepreneurs and businesses with investors, buyers, mentors, advisors and learning, across the whole life of a business.",
            },
            {
              q: "Who runs Erudite Africa Connect?",
              a: "Erudite Africa Connect is operated by Erudite Africa Investments PLC, based in Addis Ababa.",
            },
            {
              q: "Is Erudite Africa Connect a stock exchange?",
              a: "No. Erudite Africa Connect is a private matching and information platform. It does not list or trade securities and is not regulated as an exchange. Businesses that want to list publicly may use Erudite Africa Connect to prepare for the Ethiopian Securities Exchange.",
            },
            {
              q: "Is it free?",
              a: "Yes, you can join and use core features free. Paid plans add visibility, verified diagnostics and more contacts.",
            },
            {
              q: "Which languages are supported?",
              a: (
                <>
                  English and Amharic at launch, with Afaan Oromo and Tigrinya planned next.
                </>
              ),
            },
          ]}
        />
      </Section>

      <Section id="businesses" tone="canvas" title="For businesses">
        <Faq
          items={[
            {
              q: "Will my business be named publicly?",
              a: "Not unless you choose. Listings show an anonymous teaser, and you approve each investor or buyer before they see your identity.",
            },
            {
              q: "What is the EHIRA grade?",
              a: "EHIRA, the Enterprise Health & Investment Readiness Assessment, grades your business from A to E across eight dimensions, from financial health to investment readiness, and adds a readiness rating. A verified grade is reviewed by an Erudite Africa Connect analyst.",
            },
            {
              q: "How long does it take to raise money or sell?",
              a: "It depends on your business, the market and the deal. Many transactions take several months. Erudite Africa Connect helps you prepare so you do not lose time.",
            },
            {
              q: "What if my business is in trouble?",
              a: "Start with the free EHIRA assessment and talk to a recovery advisor. The earlier you act, the more options you have.",
            },
          ]}
        />
      </Section>

      <Section id="investors" title="For investors">
        <Faq
          items={[
            {
              q: "Who can invest through Erudite Africa Connect?",
              a: (
                <>
                  Individuals and organizations that complete our investor verification. Foreign and diaspora investors must also
                  follow Ethiopian investment rules for their sector. Our team will guide you on what applies to you.
                </>
              ),
            },
            {
              q: "Does Erudite Africa Connect give investment advice?",
              a: "No. We provide information, tools and introductions. Make your own assessment and take professional advice.",
            },
            {
              q: "Does Erudite Africa Connect hold investor funds?",
              a: (
                <>
                  No. Payments for investments or acquisitions are made directly between the parties, through their banks or
                  advisors.
                </>
              ),
            },
          ]}
        />
      </Section>

      <CtaBand title="How can we help?">
        <ButtonLink href="/help" variant="light">
          Visit the Help Center
        </ButtonLink>
        <ButtonLink href="/contact" variant="light">
          Get in touch
        </ButtonLink>
      </CtaBand>
    </>
  );
}
