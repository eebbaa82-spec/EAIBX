import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { AudienceCtas, AudiencePageBody, audiences } from "@/components/group-a/audiences";

const audience = audiences.investors;

export const metadata: Metadata = {
  title: "For Investors and Buyers · Erudite Africa Connect",
  description: audience.subhead,
};

export default function Page() {
  return (
    <>
      <PageHero eyebrow={audience.tab} title={audience.title} subhead={audience.subhead}>
        <AudienceCtas audience={audience} variant="light" />
      </PageHero>
      <AudiencePageBody audience={audience} />
    </>
  );
}
