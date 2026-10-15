import Link from "next/link";
import {
  ButtonLink,
  Card,
  CardGrid,
  Container,
  CtaBand,
  EmptyState,
  FeatureList,
  Section,
  Steps,
  Tbc,
  TrustBar,
} from "@/components/ui";

const paths = [
  {
    audience: "Entrepreneurs",
    heading: "Grow your idea into a business",
    body: "Join an incubation or acceleration program, get matched with a mentor and build an investor-ready profile.",
    link: "Start growing",
    href: "/for-entrepreneurs",
  },
  {
    audience: "Business owners",
    heading: "Raise capital or sell with confidence",
    body: "List your business privately, share a verified Health Check score, and talk only to serious, vetted buyers and investors.",
    link: "List your business",
    href: "/marketplace/new",
  },
  {
    audience: "Investors",
    heading: "Find deals you can trust",
    body: "Browse diagnosed, graded opportunities across Ethiopian sectors, request access to deal rooms and track your pipeline in one place.",
    link: "Start investing",
    href: "/for-investors",
  },
  {
    audience: "Businesses under pressure",
    heading: "Recover before it is too late",
    body: "Take a free Health Check, get a recovery plan from accredited turnaround advisors, and explore restructuring or a managed sale if needed.",
    link: "Begin recovery",
    href: "/recovery",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 py-20 text-white sm:py-28">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              Where Ideas Grow, Investments Flow, and Businesses Recover.
            </h1>
            <p className="mt-6 text-lg text-brand-100 sm:text-xl">
              EABIX is Ethiopia&apos;s first complete business and investment exchange. Raise capital, sell or buy a business,
              join an accelerator, fix what is holding you back, and meet investors who are ready to act, all in one trusted place.
            </p>
            <form action="/marketplace/" className="mt-8 flex max-w-2xl gap-2" role="search">
              <label htmlFor="hero-search" className="sr-only">
                Search EABIX
              </label>
              <input
                id="hero-search"
                name="q"
                type="search"
                placeholder={'Search businesses, sectors or investors, for example "agro-processing in Oromia"'}
                className="w-full rounded-lg border-0 px-4 py-3 text-ink placeholder:text-muted"
              />
              <button type="submit" className="rounded-lg bg-gold-500 px-5 py-3 font-semibold text-ink hover:bg-gold-400">
                Search
              </button>
            </form>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/for-entrepreneurs" variant="light">
                I&apos;m raising capital
              </ButtonLink>
              <ButtonLink href="/for-investors" variant="light">
                I&apos;m investing
              </ButtonLink>
              <ButtonLink href="/recovery" variant="light">
                I need to turn my business around
              </ButtonLink>
            </div>
            <p className="mt-6 text-sm text-brand-100">Free to join. Verified profiles. Built in Addis Ababa.</p>
          </div>
        </Container>
      </section>

      <div className="border-b border-line bg-white py-6">
        <Container>
          <p className="text-center text-sm text-muted">
            <Tbc>number</Tbc> businesses listed · <Tbc>ETB amount</Tbc> in opportunities · <Tbc>number</Tbc> verified investors ·{" "}
            <Tbc>number</Tbc> mentors and advisors
          </p>
          <p className="mt-2 text-center text-sm italic text-muted">
            Launch fallback: Founding members now joining from Addis Ababa, Hawassa, Bahir Dar, Mekelle, Dire Dawa and beyond.
          </p>
        </Container>
      </div>

      <Section title="Choose your path">
        <CardGrid cols={4}>
          {paths.map((p) => (
            <Card
              key={p.audience}
              title={
                <>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">{p.audience}</span>
                  {p.heading}
                </>
              }
              footer={
                <Link href={p.href} className="font-semibold text-brand-700 hover:underline">
                  {p.link} →
                </Link>
              }
            >
              {p.body}
            </Card>
          ))}
        </CardGrid>
      </Section>

      <TrustBar />

      <Section title="How EABIX works" tone="canvas">
        <Steps
          steps={[
            { title: "Create your profile.", body: "Tell us who you are and what you need. It takes about ten minutes." },
            {
              title: "Get diagnosed.",
              body: "Our Business Health Check scores your business across finance, operations, market, people and governance, from grade A to E.",
            },
            {
              title: "Get matched.",
              body: "EABIX introduces you to the right programs, mentors, advisors, investors or buyers based on your profile and score.",
            },
            {
              title: "Close and grow.",
              body: "Share documents in a secure deal room, agree terms with expert support, and keep building with the Academy.",
            },
          ]}
        />
        <div className="mt-8">
          <ButtonLink href="/how-it-works">See how it works</ButtonLink>
        </div>
      </Section>

      <Section title="Opportunities this week" intro="A selection of verified businesses currently raising capital or open to acquisition.">
        <EmptyState action={<ButtonLink href="/marketplace" variant="secondary">Browse all opportunities</ButtonLink>}>
          Featured listings will appear here once the first verified businesses go live. Each card shows sector, region, amount
          sought in ETB and its A to E health grade.
        </EmptyState>
      </Section>

      <Section title="The only platform that covers the whole life of a business." tone="canvas">
        <FeatureList
          items={[
            { title: "From idea to exit.", body: "Incubation, investment, growth and sale on one platform, so your track record follows you." },
            { title: "Scores, not just pitches.", body: "Investors see an independent health grade, not only what a founder chooses to show." },
            { title: "Recovery, not just rescue.", body: "Diagnostics and turnaround support come before a distressed sale, not after." },
            {
              title: "Bank-ready by design.",
              body: "Our Credit Management Center helps businesses manage their bank and MFI relationships, and helps lenders complete client due diligence faster.",
            },
            {
              title: "Made for Ethiopia.",
              body: "Pay in Birr through Chapa or Telebirr, read in Amharic or English, and use templates built for Ethiopian law.",
            },
          ]}
        />
      </Section>

      <Section
        title="Programs accepting applications"
        intro="Incubators, accelerators and competitions run on EABIX by leading institutions."
      >
        <EmptyState action={<ButtonLink href="/programs" variant="secondary">See all programs</ButtonLink>}>
          Open programs will be listed here with their organizer and deadline.
        </EmptyState>
      </Section>

      <Section title="Built with the people it serves" tone="canvas">
        <p className="text-muted">
          <Tbc>three real testimonials with name, role, company and photo, collected from pilot users. Do not publish until approved in writing.</Tbc>
        </p>
      </Section>

      <Section title="In partnership with">
        <p className="text-muted">
          <Tbc>partner logos and written permission to display them</Tbc>
        </p>
      </Section>

      <Section title="Training that builds careers and businesses" tone="canvas">
        <p className="max-w-3xl text-lg text-muted">
          Professional courses and certifications in banking, credit, capital markets and investment banking, plus practical
          courses for founders, in Amharic and English. Banks and MFIs can enroll whole teams.
        </p>
        <div className="mt-6">
          <ButtonLink href="/academy">Explore the Academy</ButtonLink>
        </div>
      </Section>

      <CtaBand
        title="Your next chapter starts here."
        body="Whether you are starting, scaling, investing or recovering, EABIX gives you the people, data and tools to move forward."
      >
        <ButtonLink href="/join" variant="light">
          Join EABIX free
        </ButtonLink>
        <ButtonLink href="/contact" variant="ghost" className="text-white">
          Talk to our team
        </ButtonLink>
      </CtaBand>
    </>
  );
}
