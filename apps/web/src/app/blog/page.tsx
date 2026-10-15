import type { Metadata } from "next";
import { NewsletterForm } from "@/components/forms";
import { Container, PageHero, Section, TagList } from "@/components/ui";

export const metadata: Metadata = {
  title: "EABIX Insights · Business and Investing",
  description: "Founder stories, investor perspectives and market analysis from Ethiopia's growth economy.",
};

const upcoming = [
  "Introducing EABIX: why Ethiopia needs a business exchange for the whole business lifecycle",
  "Five things investors check before they reply to your email",
  "Struggling is not failing: how early diagnosis saves good businesses",
  "What the Ethiopian Securities Exchange means for SMEs today",
  "The diaspora investor's guide to backing Ethiopian business",
  "Banking on trust: how businesses and lenders build stronger credit relationships",
];

export default function BlogPage() {
  return (
    <>
      <PageHero
        title="Insights from Ethiopia's growth economy"
        subhead="Founder stories, investor perspectives, market analysis and EABIX news."
      />

      <Section title="Categories">
        <TagList items={["Founder stories", "Investing", "Recovery and resilience", "Policy and markets", "How-to", "EABIX news"]} />
      </Section>

      <Section tone="canvas" title="Coming soon">
        <ul className="grid gap-4 md:grid-cols-2">
          {upcoming.map((t) => (
            <li key={t} className="flex flex-col rounded-xl border border-line bg-white p-6 shadow-sm">
              <span className="mb-2 w-fit rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-ink">Coming soon</span>
              <span className="font-semibold text-ink">{t}</span>
            </li>
          ))}
        </ul>
      </Section>

      <section className="bg-brand-900 py-16 text-white">
        <Container className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-xl text-2xl font-bold">Found this useful? Get the EABIX Brief every two weeks.</h2>
          <NewsletterForm />
        </Container>
      </section>
    </>
  );
}
