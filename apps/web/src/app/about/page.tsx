import type { Metadata } from "next";
import { ButtonLink, Card, CardGrid, DataTable, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "About Erudite Connect · Erudite Africa Investments",
  description:
    "Erudite Connect connects Ethiopian businesses with capital, expertise and knowledge across the full business lifecycle. Meet the team and our mission.",
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

const company = [
  ["Registered name", "Erudite Africa Investments PLC"],
  ["Registration", "No. MT/AA/2/0063282/2018, Ministry of Trade and Regional Integration, Federal Democratic Republic of Ethiopia"],
  ["Founded", "May 2020 as an advisory practice; incorporated as a private limited company in February 2026"],
  ["Managing Director", "Befikadu Eba"],
  ["Registered office", "Bole Sub City, Woreda 03, Addis Ababa"],
  [
    "Divisions",
    "Foreign investment facilitation · Management consultancy and corporate re-engineering · Professional project management · Capacity training, human capital and financial inclusion · Applied market research and B2B corporate systems",
  ],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Erudite Connect"
        title="We are building the exchange Ethiopian business has been waiting for."
        subhead="Ethiopia has one of Africa's fastest-growing economies, a young and ambitious generation of founders, and thousands of established businesses with real value. What it has lacked is one trusted place where ideas meet capital, where good businesses can find buyers, and where struggling businesses can find a way back. Erudite Connect is that place."
      />

      <Section title="Our story">
        <p className="max-w-3xl text-lg text-muted">
          Erudite Connect, Erudite Africa&apos;s business and investment platform, was founded by Erudite Africa Investments PLC to close
          the gap between Ethiopian enterprise and the capital, skills and networks it needs.
        </p>
        <p className="mt-4 max-w-3xl text-lg text-muted">
          Erudite Africa was established in May 2020 by Befikadu Eba, a corporate banker and macro-advisory professional with
          over 16 years of experience in capital allocation, risk assessment and financial inclusion. It began as an advisory
          practice working closely with investors, regulators and financial institutions, and in February 2026 it was
          incorporated as Erudite Africa Investments PLC, with a management team of specialist division heads.
        </p>
        <p className="mt-4 max-w-3xl text-lg text-muted">
          Through that work, the firm saw the same gaps again and again: good businesses that could not reach investors,
          investors who could not find reliable information, and struggling businesses that asked for help too late. Erudite Connect
          brings Erudite Africa&apos;s investment facilitation, turnaround, market intelligence and training expertise onto one
          platform, so many more businesses can reach it.
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
        <DataTable head={["Value", "What it means on Erudite Connect"]} rows={values} />
      </Section>

      <Section title="The company behind Erudite Connect" intro="Erudite Connect is operated by Erudite Africa Investments PLC, a strategic advisory, investment facilitation and capacity-building firm based in Addis Ababa.">
        <DataTable head={["Item", "Details"]} rows={company} />
        <div className="mt-6">
          <ButtonLink href="/about/team" variant="secondary">
            Meet the team
          </ButtonLink>
        </div>
      </Section>

      <Section tone="canvas">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/join">Join Erudite Connect free</ButtonLink>
          <ButtonLink href="/partners" variant="secondary">
            Partner with us
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
