import type { Metadata } from "next";
import { ButtonLink, Card, CardGrid, DataTable, PageHero, Section, Tbc } from "@/components/ui";

export const metadata: Metadata = {
  title: "About EABIX · Erudite Africa Investments",
  description:
    "EABIX connects Ethiopian businesses with capital, expertise and knowledge across the full business lifecycle. Meet the team and our mission.",
};

const pillars = [
  {
    title: "Grow.",
    body: "Incubation, acceleration, mentorship and an online Academy that turn ideas into investable companies.",
  },
  {
    title: "Invest.",
    body: "A curated marketplace and secure deal rooms that connect verified businesses with local and international investors.",
  },
  {
    title: "Recover.",
    body: "Business diagnostics, turnaround advisory, bank and MFI credit relationship support and a responsible exchange for distressed assets.",
  },
];

const values = [
  ["Integrity", "We verify, we disclose, and we never sell your data."],
  ["Inclusion", "Women-led, rural and first-time founders get an equal path to capital."],
  ["Evidence", "Decisions are better when they rest on data, so we measure what matters."],
  ["Partnership", "We win only when entrepreneurs, investors and partners win together."],
  ["Resilience", "Setbacks are part of business. We help people recover, learn and go again."],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About EABIX"
        title="We are building the exchange Ethiopian business has been waiting for."
        subhead="Ethiopia has one of Africa's fastest-growing economies, a young and ambitious generation of founders, and thousands of established businesses with real value. What it has lacked is one trusted place where ideas meet capital, where good businesses can find buyers, and where struggling businesses can find a way back. EABIX is that place."
      />

      <Section title="Our story">
        <p className="max-w-3xl text-lg text-muted">
          EABIX, the Erudite Africa Business &amp; Investment Exchange, was founded by Erudite Africa Investments PLC to close
          the gap between Ethiopian enterprise and the capital, skills and networks it needs.{" "}
          <Tbc>founding year and one or two sentences on the founders&apos; background and why they started EABIX.</Tbc>
        </p>
      </Section>

      <Section tone="canvas">
        <CardGrid cols={2}>
          <Card title="Mission">
            To help Ethiopian and African businesses start, grow, raise capital and recover, by connecting them with investors,
            experts and knowledge on one trusted platform.
          </Card>
          <Card title="Vision">
            A continent where every viable business can find the capital and support it needs, and no good business fails for
            lack of a second chance.
          </Card>
        </CardGrid>
      </Section>

      <Section title="What we do">
        <CardGrid cols={3}>
          {pillars.map((p) => (
            <Card key={p.title} title={p.title}>
              {p.body}
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Section title="Our values" tone="canvas">
        <DataTable head={["Value", "What it means on EABIX"]} rows={values} />
      </Section>

      <Section>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/join">Join EABIX free</ButtonLink>
          <ButtonLink href="/partners" variant="secondary">
            Partner with us
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
