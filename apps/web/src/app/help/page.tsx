import type { Metadata } from "next";
import { ButtonLink, CtaBand, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "How can we help? · Investopia",
  description:
    "Investopia Help Center: getting started, accounts, listings, EHIRA assessment, deal rooms, programs, payments and trust and safety.",
};

const topics = [
  "Getting started",
  "Your account and security",
  "Listings and the marketplace",
  "EHIRA assessment",
  "Deal rooms and data rooms",
  "Programs and mentoring",
  "Payments and plans",
  "Trust and safety",
];

export default function HelpPage() {
  return (
    <>
      <PageHero title="How can we help?">
        <form action="/help/" role="search" className="flex w-full max-w-2xl gap-2">
          <label htmlFor="help-search" className="sr-only">
            Search help articles
          </label>
          <input
            id="help-search"
            name="q"
            type="search"
            placeholder={'Search help articles, for example "how to upload documents"'}
            className="w-full rounded-lg border-0 px-4 py-3 text-ink placeholder:text-muted"
          />
          <button type="submit" className="rounded-lg bg-gold-500 px-5 py-3 font-semibold text-ink hover:bg-gold-400">
            Search
          </button>
        </form>
      </PageHero>

      <Section title="Topics">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <li key={t} className="rounded-xl border border-line bg-white p-5 font-semibold text-ink shadow-sm">
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        title="Still need help?"
        body={
          <>
            Our support team is available Monday to Friday, 8:30 a.m. to 5:30 p.m. East Africa Time.
          </>
        }
      >
        <ButtonLink href="/contact" variant="light">
          Chat with us
        </ButtonLink>
        <ButtonLink href="/contact" variant="light">
          Email support
        </ButtonLink>
      </CtaBand>
    </>
  );
}
