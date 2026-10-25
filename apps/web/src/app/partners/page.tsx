import type { Metadata } from "next";
import { ButtonLink, DataTable, FeatureList, PageHero, Section } from "@/components/ui";
import { PreviewForm } from "@/components/forms";

export const metadata: Metadata = {
  title: "Partner With Kenna Ventures · Programs and Deal Flow",
  description: "Banks, DFIs, government and corporates use Kenna Ventures to run programs, source deals and measure impact.",
};

const partnerTypes: [string, string][] = [
  [
    "Banks and microfinance institutions",
    "Find bankable SMEs with verified EHIRA grades, speed up client due diligence, monitor borrowers after disbursement, and manage credit relationships through the Credit Management Center.",
  ],
  [
    "Development finance institutions and donors",
    "Run challenge funds, accelerators and technical assistance programs with transparent selection and impact reporting.",
  ],
  [
    "Government agencies",
    "Support SME growth, job creation and investment promotion with live data on businesses and sectors.",
  ],
  [
    "Universities and incubators",
    "Give your startups a digital home, access to mentors and a route to investors after graduation.",
  ],
  [
    "Corporates",
    "Find suppliers, acquisition targets and innovation partners, and run your own enterprise development programs.",
  ],
  ["Professional firms", "Reach new clients as a listed advisor and support businesses through programs."],
];

const ways = [
  {
    title: "Host a program.",
    body: "Launch a branded incubator, accelerator or competition on Kenna Ventures with application, selection and cohort tools included.",
  },
  {
    title: "Sponsor a Deal Room.",
    body: "Back a sector-themed Deal Room and get first sight of its businesses.",
  },
  {
    title: "Co-create content.",
    body: "Publish research, guides or toolkits in the Knowledge Hub.",
  },
  {
    title: "Integrate.",
    body: (
      <>
        Connect your systems to Kenna Ventures for referrals and reporting. API access for partners is planned after launch.
      </>
    ),
  },
];

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="Partner with us"
        title="Reach, support and fund Ethiopian businesses at scale."
        subhead="Kenna Ventures gives institutions a ready-made platform to run programs, source deals and measure impact, without building technology from scratch."
      >
        <ButtonLink href="#lets-talk" variant="light">
          Request a call
        </ButtonLink>
        <ButtonLink href="#ways-to-partner" variant="light">
          Ways to partner
        </ButtonLink>
      </PageHero>

      <Section title="Who we partner with">
        <DataTable head={["Partner type", "What Kenna Ventures does for you"]} rows={partnerTypes} />
      </Section>

      <Section id="ways-to-partner" title="Ways to partner" tone="canvas">
        <FeatureList items={ways} />
      </Section>

      <Section
        title="Measure what matters"
        intro="Partner dashboards track applications, selections, mentoring hours, capital raised, jobs supported and EHIRA grade improvements over time, broken down by gender, region and sector. Export reports for your board and funders in one click."
      />

      <Section id="lets-talk" title="Let's talk" tone="canvas">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-xl border border-line bg-white p-6">
            <PreviewForm
              formName="partnership"
              submitLabel="Request a call"
              confirmation="Thank you. A member of our partnerships team will contact you within two working days."
              fields={[
                { name: "fullName", label: "Full name", required: true },
                { name: "organization", label: "Organization", required: true },
                { name: "role", label: "Role", required: true },
                { name: "email", label: "Email", type: "email", required: true },
                { name: "phone", label: "Phone", type: "tel" },
                {
                  name: "partnerType",
                  label: "Partner type",
                  type: "select",
                  required: true,
                  options: partnerTypes.map(([t]) => t),
                },
                { name: "goals", label: "What would you like to achieve?", type: "textarea", required: true },
              ]}
            />
          </div>
          <div>
            <h3 className="font-semibold text-ink">Download</h3>
            <p className="mt-2 text-muted">
              A four-page overview of Kenna Ventures for banks, development partners, government agencies, universities and corporates.
            </p>
            <p className="mt-4">
              <a
                href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/downloads/Kenna-Partner-Brochure.pdf`}
                download
                className="inline-flex rounded-lg bg-brand-700 px-4 py-2 font-semibold text-white hover:bg-brand-600"
              >
                Download the partner brochure (PDF)
              </a>
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
