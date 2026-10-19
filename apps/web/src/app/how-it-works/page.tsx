import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AudienceOverviewSection, audienceOrder, audiences } from "@/components/group-a/audiences";

export const metadata: Metadata = {
  title: "How Erudite Connect Works for Founders and Investors",
  description:
    "See how entrepreneurs, investors, mentors and partners use Erudite Connect to grow, invest and recover, step by step.",
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHero title="One platform. Every stage of business." subhead="Pick your role to see how Erudite Connect works for you." />
      <nav aria-label="Choose your role" className="border-b border-line bg-white">
        <Container>
          <ul className="flex gap-2 overflow-x-auto py-3">
            {audienceOrder.map((key) => (
              <li key={key} className="flex-none">
                <Link
                  href={`#${key}`}
                  className="inline-block rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-brand-600 hover:text-brand-700"
                >
                  {audiences[key].tab}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>
      {audienceOrder.map((key, i) => (
        <AudienceOverviewSection key={key} audience={audiences[key]} tone={i % 2 === 0 ? "white" : "canvas"} />
      ))}
    </>
  );
}
