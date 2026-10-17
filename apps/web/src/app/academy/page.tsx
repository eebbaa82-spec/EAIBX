import type { Metadata } from "next";
import {
  ButtonLink,
  CtaBand,
  DataTable,
  FeatureList,
  Note,
  PageHero,
  Section,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "EABIX Academy · Banking and Finance Training",
  description:
    "Certified courses in banking, credit, capital markets and investment banking, with enterprise plans for banks and MFIs.",
};

type School = { name: string; intro: string; courses: [string, string][] };

const schools: School[] = [
  {
    name: "School of Banking Fundamentals",
    intro: "Build the core knowledge every banker needs, from regulation to credit, treasury and trade finance.",
    courses: [
      ["Ethiopian Banking Law and Regulation", "Foundational"],
      ["Resource Mobilization Strategies and Frameworks", "Foundational, Intermediate"],
      ["Ethiopian Regulatory Landscape for International Operations", "Intermediate"],
      ["International Trade Finance Instruments", "Foundational, Intermediate"],
      ["Credit Analysis and Risk Management", "Foundational, Intermediate, Advanced"],
      ["Loan Portfolio Management", "Intermediate"],
      ["Treasury and Forex Management", "Intermediate"],
      ["Digital Banking and Fintech Integration", "Foundational"],
      ["Customer Service and Retail Banking Excellence", "Foundational"],
      ["Sales and Negotiation Skills", "Foundational"],
      ["Supply Chain Finance for Ethiopian Exports and Imports", "Intermediate"],
      ["Foreign Exchange (Forex) Products and Risk Management", "Intermediate"],
      ["International Money Transfers and Remittances", "Foundational"],
      ["Project Finance", "Intermediate, Advanced"],
      ["Syndicated Loans and Cross-Border Project Finance", "Advanced"],
    ],
  },
  {
    name: "School of Capital Markets and Investment",
    intro: "Understand how capital markets work in Ethiopia and how to analyze, advise on and manage investments.",
    courses: [
      ["Introduction to Capital Markets", "Foundational"],
      ["Ethiopian Capital Markets Law and Regulation", "Foundational, Advanced"],
      ["Securities", "Foundational, Advanced"],
      ["Investment Analysis and Portfolio Management", "Foundational, Advanced"],
      ["Brokerage Operations and Client Advisory", "Foundational, Advanced"],
    ],
  },
  {
    name: "School of Investment Banking",
    intro:
      "Advanced, hands-on training in valuation, deals and capital raising for investment bankers, fund managers and corporate finance teams.",
    courses: [
      ["Financial Modeling and Company Valuation", "Foundational, Intermediate, Advanced"],
      ["Leveraged Buyout (LBO) Modeling", "Advanced"],
      ["Mergers and Acquisitions (M&A) Strategy and Execution", "Advanced"],
      ["Due Diligence Mastery", "Intermediate, Advanced"],
      ["Equity Capital Markets (ECM)", "Advanced"],
      ["Debt Capital Markets (DCM)", "Advanced"],
      ["Origination and Pitch Deck Development", "Intermediate"],
      ["Negotiation and Deal Structuring", "Advanced"],
      ["Sector-Specific Analysis and Modeling", "Advanced"],
      ["Private Equity and Venture Capital", "Intermediate, Advanced"],
      ["ESG Integration in Investment Banking", "Advanced"],
    ],
  },
  {
    name: "School of Professional Skills",
    intro: "Cross-cutting skills that strengthen every role in a modern financial institution or growing business.",
    courses: [
      ["Corporate Governance and Ethics", "Foundational"],
      ["Risk Management Framework", "Foundational, Intermediate"],
      ["Strategic Leadership and Change Management", "Intermediate"],
      ["Sustainable Finance and ESG (Environmental, Social, Governance)", "Foundational"],
      ["Data Analytics and Digital Literacy", "Foundational"],
      ["Gender-Sensitive Financial Services", "Foundational"],
      ["Digital Marketing and Digital Banking", "Foundational"],
      ["Social Media Management", "Foundational"],
    ],
  },
];

export default function AcademyPage() {
  return (
    <>
      <PageHero
        eyebrow="EABIX Academy"
        title="Professional training for Ethiopia's finance and business leaders"
        subhead="Practical courses and certifications in banking, credit, capital markets, investment banking and business skills, built for the Ethiopian market and available in Amharic and English."
      >
        <ButtonLink href="#catalog" variant="light">
          Browse courses
        </ButtonLink>
        <ButtonLink href="/contact" variant="light">
          Get an enterprise quote
        </ButtonLink>
      </PageHero>

      <div className="border-b border-line bg-white py-6">
        <div className="mx-auto flex max-w-6xl justify-center px-4">
          <nav aria-label="Academy audiences">
            <ul className="flex flex-wrap justify-center gap-2 text-sm">
              <li>
                <a href="#catalog" className="rounded-full border border-line px-3 py-1 text-ink hover:border-brand-500">
                  For individuals
                </a>
              </li>
              <li>
                <a href="#enterprise" className="rounded-full border border-line px-3 py-1 text-ink hover:border-brand-500">
                  For banks and institutions
                </a>
              </li>
              <li>
                <a href="#entrepreneurs" className="rounded-full border border-line px-3 py-1 text-ink hover:border-brand-500">
                  For entrepreneurs
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <Section
        id="catalog"
        title="Course catalog"
        intro="Four schools, all delivered in a hybrid format that combines online learning with live or classroom sessions, and offered at Foundational, Intermediate and Advanced levels where shown. Each course card shows: Title · School · Level · Duration · Language · Format · Price in ETB · Certificate badge."
      >
        <div className="space-y-12">
          {schools.map((school) => (
            <div key={school.name}>
              <h3 className="text-xl font-semibold text-ink">{school.name}</h3>
              <p className="mt-1 mb-4 italic text-muted">{school.intro}</p>
              <DataTable head={["Course", "Levels"]} rows={school.courses} />
            </div>
          ))}
          <Note>
            Course durations, schedules and fees are shared when enrollment opens, or on request.
          </Note>
        </div>
      </Section>

      <Section
        id="certification"
        tone="canvas"
        eyebrow="Credit certification paths"
        title="Get certified in credit"
        intro={
          <>
            Structured learning paths that take credit staff from the basics to confident, independent decision-making. Each
            path ends with an assessment and an EABIX certificate in the path&apos;s name, issued by Erudite Africa Investments PLC
            together with partner institutions.
          </>
        }
      >
        <DataTable
          head={["Path", "For", "Covers"]}
          rows={[
            [
              "Credit Foundations",
              "New credit officers and relationship staff",
              "Credit analysis basics, appraisal, due diligence basics, banking law and regulation",
            ],
            [
              "Credit Practitioner",
              "Credit analysts and relationship managers",
              "Intermediate credit analysis and appraisal, relationship management, credit follow-up and monitoring, intermediate due diligence, loan portfolio management",
            ],
            [
              "Advanced Credit and Risk",
              "Senior analysts, credit committee members and risk managers",
              "Advanced credit analysis and risk management, project finance, syndicated loans, risk management framework",
            ],
          ]}
        />
      </Section>

      <Section
        id="enterprise"
        eyebrow="For banks and institutions: Enterprise subscriptions"
        title="Train and certify your whole team"
        intro="Banks, MFIs and other institutions can subscribe on behalf of their staff. Give employees access to the full catalog, assign learning paths by role, and track progress and certification from one dashboard."
      >
        <FeatureList
          items={[
            {
              title: "Role-based learning paths.",
              body: "Assign the right credit, treasury, trade finance or capital markets path to each team.",
            },
            {
              title: "Manager dashboard.",
              body: "See enrollment, completion, assessment scores and certificates by branch, department or employee.",
            },
            {
              title: "Blended delivery.",
              body: "Combine self-paced online courses with live virtual classes or on-site workshops for your staff.",
            },
            {
              title: "Custom content.",
              body: (
                <>
                  Add your institution&apos;s own policies and procedures alongside EABIX courses.
                </>
              ),
            },
            { title: "Simple billing.", body: "One annual invoice in ETB, priced per seat." },
          ]}
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/contact">Get an enterprise quote</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Download the course catalog (PDF)
          </ButtonLink>
        </div>
      </Section>

      <div id="entrepreneurs" className="scroll-mt-20">
        <CtaBand
          title="Learn what investors and lenders look for"
          body="Short courses for founders and SME managers on financial statements, building a financial model, pitching, cash flow and working with your bank. Your EHIRA report recommends courses for your weakest areas."
        >
          <ButtonLink href="/join" variant="light">
            Explore courses for entrepreneurs
          </ButtonLink>
        </CtaBand>
      </div>
    </>
  );
}
