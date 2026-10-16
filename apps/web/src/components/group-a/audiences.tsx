import type { ReactNode } from "react";
import { ButtonLink, Card, CardGrid, FeatureList, Section, Steps, TagList } from "@/components/ui";

/**
 * Shared copy for the four audience pages (copy section 4). Used by
 * /how-it-works (overview) and the dedicated /for-* landing pages so the
 * wording stays identical in both places.
 */

type Block =
  | { kind: "steps"; heading: string; items: { title: string; body?: ReactNode }[] }
  | { kind: "features"; heading: string; items: { title: string; body: ReactNode }[] }
  | { kind: "cards"; heading: string; items: { title: string; body: ReactNode }[] }
  | { kind: "tags"; heading: string; items: string[] };

export type AudienceKey = "entrepreneurs" | "investors" | "advisors" | "partners";

export type Audience = {
  key: AudienceKey;
  tab: string;
  href: string;
  title: string;
  subhead: string;
  blocks: Block[];
  ctas: { label: string; href: string }[];
};

export const audiences: Record<AudienceKey, Audience> = {
  entrepreneurs: {
    key: "entrepreneurs",
    tab: "Entrepreneurs and business owners",
    href: "/for-entrepreneurs",
    title: "Raise capital, grow faster or sell on your terms.",
    subhead:
      "Whether you have an idea on paper or a business with twenty years of history, EABIX gives you a clear path to the next stage.",
    blocks: [
      {
        kind: "steps",
        heading: "How it works",
        items: [
          {
            title: "Join free and build your profile.",
            body: "Add your business basics, team, traction and what you are looking for.",
          },
          {
            title: "Take the Business Health Check.",
            body: "Get an independent A to E grade and a short report on your strengths and gaps.",
          },
          {
            title: "Choose your route.",
            body: "Apply to a program, request a mentor, list for investment, or list your business for sale.",
          },
          {
            title: "Meet the right people.",
            body: "We match you with investors, buyers, mentors and advisors. You decide who sees what.",
          },
          {
            title: "Close the deal.",
            body: "Share documents in a secure deal room and get expert help with valuation, terms and due diligence.",
          },
        ],
      },
      {
        kind: "features",
        heading: "Benefits",
        items: [
          {
            title: "Stay confidential.",
            body: "Your listing shows an anonymous teaser until you approve each investor or buyer.",
          },
          {
            title: "Be taken seriously.",
            body: "A verified health grade tells investors you have nothing to hide.",
          },
          {
            title: "Get better, not just funded.",
            body: "Every gap in your report links to a course, a mentor or an advisor who can fix it.",
          },
        ],
      },
    ],
    ctas: [
      { label: "List your business", href: "/marketplace/new" },
      { label: "Take the free Health Check", href: "/diagnostics" },
    ],
  },
  investors: {
    key: "investors",
    tab: "Investors and buyers",
    href: "/for-investors",
    title: "Verified Ethiopian deal flow, without the noise.",
    subhead:
      "EABIX helps angel investors, funds, family offices, corporates and diaspora investors find, assess and close opportunities with confidence.",
    blocks: [
      {
        kind: "steps",
        heading: "How it works",
        items: [
          {
            title: "Create your investor profile.",
            body: "Set your sectors, ticket size, stage and regions of interest.",
          },
          {
            title: "Get verified.",
            body: "Complete our investor verification so businesses know you are genuine.",
          },
          {
            title: "Receive matched opportunities.",
            body: "Get alerts for businesses that fit your mandate, each with a health grade and summary.",
          },
          {
            title: "Request deal room access.",
            body: "Review financials, legal documents and management Q&A in a secure, watermarked space.",
          },
          {
            title: "Invest or acquire.",
            body: "Agree terms directly or with an EABIX-listed advisor, and track your portfolio on your dashboard.",
          },
        ],
      },
      {
        kind: "features",
        heading: "Benefits",
        items: [
          {
            title: "Graded, not guessed.",
            body: "Every listed business carries an independent A to E health grade.",
          },
          {
            title: "Curated deal rooms.",
            body: "Themed showcases bring the strongest businesses in a sector to you at once.",
          },
          {
            title: "Local insight.",
            body: "Market reports, sector briefs and on-the-ground advisors reduce the cost of investing in Ethiopia.",
          },
          {
            title: "Diaspora friendly.",
            body: (
              <>
                Invest from abroad with clear guidance on Ethiopian rules and processes. Our team confirms what applies to you
                before you commit.
              </>
            ),
          },
        ],
      },
    ],
    ctas: [
      { label: "Start investing", href: "/join" },
      { label: "Browse opportunities", href: "/marketplace" },
    ],
  },
  advisors: {
    key: "advisors",
    tab: "Mentors and advisors",
    href: "/for-advisors",
    title: "Share what you know. Grow what you do.",
    subhead:
      "EABIX connects experienced professionals with founders and businesses who need their expertise, as volunteer mentors or as paid advisors.",
    blocks: [
      {
        kind: "cards",
        heading: "Two ways to take part",
        items: [
          {
            title: "Mentor.",
            body: "Give a few hours a month to guide founders in our programs. Build your profile, give back, and meet the next generation of Ethiopian business leaders.",
          },
          {
            title: "Advisor.",
            body: "List your firm or practice in our advisor directory. Offer valuation, legal, tax, audit, turnaround or transaction services to businesses and investors on the platform.",
          },
        ],
      },
      {
        kind: "steps",
        heading: "How it works",
        items: [
          { title: "Apply" },
          { title: "Get vetted" },
          { title: "Publish your profile" },
          { title: "Receive requests" },
          { title: "Deliver and get rated" },
        ],
      },
    ],
    ctas: [
      { label: "Become a mentor", href: "/join" },
      { label: "Join as an advisor", href: "/join" },
    ],
  },
  partners: {
    key: "partners",
    tab: "Partner institutions",
    href: "/for-partners",
    title: "Run your programs and pipelines on EABIX.",
    subhead:
      "Banks, DFIs, government agencies, universities and corporates use EABIX to find, support and fund businesses at scale, with the data to prove impact.",
    blocks: [
      {
        kind: "tags",
        heading: "What you get",
        items: [
          "A branded program space",
          "Application and selection tools",
          "Cohort and mentor management",
          "Investor-ready pipelines",
          "Impact dashboards and reports",
        ],
      },
    ],
    ctas: [{ label: "Partner with us", href: "/partners" }],
  },
};

export const audienceOrder: AudienceKey[] = ["entrepreneurs", "investors", "advisors", "partners"];

function BlockBody({ block }: { block: Block }) {
  switch (block.kind) {
    case "steps":
      return <Steps steps={block.items} />;
    case "features":
      return <FeatureList items={block.items} />;
    case "cards":
      return (
        <CardGrid cols={2}>
          {block.items.map((item) => (
            <Card key={item.title} title={item.title}>
              {item.body}
            </Card>
          ))}
        </CardGrid>
      );
    case "tags":
      return <TagList items={block.items} />;
  }
}

/** Body of a dedicated /for-* landing page (the hero is rendered by the page). */
export function AudiencePageBody({ audience }: { audience: Audience }) {
  const last = audience.blocks.length - 1;
  return (
    <>
      {audience.blocks.map((block, i) => (
        <Section key={block.heading} title={block.heading} tone={i % 2 === 0 ? "white" : "canvas"}>
          <BlockBody block={block} />
          {i === last && (
            <div className="mt-10 flex flex-wrap gap-3">
              <AudienceCtas audience={audience} variant="primary" />
            </div>
          )}
        </Section>
      ))}
    </>
  );
}

export function AudienceCtas({ audience, variant }: { audience: Audience; variant: "light" | "primary" }) {
  return (
    <>
      {audience.ctas.map((cta, i) => (
        <ButtonLink key={cta.label} href={cta.href} variant={i === 0 ? variant : variant === "light" ? "light" : "secondary"}>
          {cta.label}
        </ButtonLink>
      ))}
    </>
  );
}

/** One audience rendered as a section of the /how-it-works overview. */
export function AudienceOverviewSection({ audience, tone }: { audience: Audience; tone: "white" | "canvas" }) {
  return (
    <Section id={audience.key} eyebrow={audience.tab} title={audience.title} intro={audience.subhead} tone={tone}>
      <div className="space-y-10">
        {audience.blocks.map((block) => (
          <div key={block.heading}>
            <h3 className="mb-5 text-xl font-semibold text-ink">{block.heading}</h3>
            <BlockBody block={block} />
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-3">
          <AudienceCtas audience={audience} variant="primary" />
          <ButtonLink href={audience.href} variant="ghost">
            More for {audience.tab.toLowerCase()} →
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
