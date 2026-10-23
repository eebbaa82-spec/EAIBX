import type { Metadata } from "next";
import { ProCatalog } from "@/components/academy/CoursePages";
import {
  ButtonLink,
  CtaBand,
  DataTable,
  FeatureList,
  PageHero,
  Section,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Investopia Academy · Banking and Finance Training",
  description:
    "Certified courses in banking, credit, capital markets and investment banking, with enterprise plans for banks and MFIs.",
};

export default function AcademyPage() {
  return (
    <>
      <PageHero
        eyebrow="Investopia Academy"
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

      <Section
        tone="canvas"
        eyebrow="Free for everyone"
        title="Financial Literacy for Everyone"
        intro="Ten short, illustrated modules on business, goals, budgeting, bookkeeping, saving, investing, borrowing, financial services, digital money and insurance. In English and Amharic, with quizzes. Free: register once to start."
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/academy/financial-literacy/">Start the free course</ButtonLink>
          <ButtonLink href="/am/academy/financial-literacy/" variant="secondary">
            <span lang="am">በአማርኛ ይማሩ</span>
          </ButtonLink>
        </div>
      </Section>

      <Section
        id="catalog"
        eyebrow="For subscribers"
        title="Course catalog"
        intro="Choose a folder to see its courses: Bank and MFI, Financial Management, Capital Market or General Courses. Every course is online and interactive, with Ethiopian examples, decisions to make, the rules that apply, worked calculations, module quizzes, a practical simulation, a final exam and a certificate. Module 1 of every course is free for registered users."
      >
        <span id="online-courses" aria-hidden="true" />
        <ProCatalog />
      </Section>

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
        id="certification"
        tone="canvas"
        eyebrow="Credit certification paths"
        title="Get certified in credit"
        intro={
          <>
            Structured learning paths that take credit staff from the basics to confident, independent decision-making. Each
            path ends with an assessment and an Investopia certificate in the path&apos;s name, issued by Erudite Africa Investments PLC
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
              title: "Training department dashboard.",
              body: "Give staff their seat codes, assign courses and due dates, and see enrollment, completion, exam and simulation scores and certificates by branch, department or employee.",
            },
            {
              title: "Blended delivery.",
              body: "Combine self-paced online courses with live virtual classes or on-site workshops for your staff.",
            },
            {
              title: "Custom content.",
              body: (
                <>
                  Add your institution&apos;s own policies and procedures alongside Investopia courses.
                </>
              ),
            },
            { title: "Simple billing.", body: "One annual invoice in ETB, priced per seat." },
          ]}
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/contact">Get an enterprise quote</ButtonLink>
          <ButtonLink href="/academy/institution/" variant="secondary">
            Institution dashboard (sign in or see the demo)
          </ButtonLink>
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
