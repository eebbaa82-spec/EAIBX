import type { Metadata } from "next";
import { PreviewForm } from "@/components/forms";
import { Note, PageHero, Section } from "@/components/ui";
import { company } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Kenna Ventures · Addis Ababa",
  description: "Talk to the Kenna Ventures team about your business, investment or partnership.",
};

const options = [
  { label: "General inquiries", value: <a href={`mailto:${company.email}`} className="text-brand-700 hover:underline">{company.email}</a> },
  { label: "Partnerships", value: <a href={`mailto:${company.email}`} className="text-brand-700 hover:underline">{company.email}</a> },
  { label: "Press", value: <a href="mailto:info@kenna.et" className="text-brand-700 hover:underline">info@kenna.et</a> },
  { label: "Phone", value: <>Office {company.phoneOffice} · Mobile {company.phoneMobile}</> },
  {
    label: "Office",
    value: (
      <>
        Rehobot Apartment Building, 1st Floor, Bole Medhanealem (in front of Kebe Cake), Addis Ababa · {company.poBox}
      </>
    ),
  },
  { label: "Office hours", value: <>{company.officeHours} (East Africa Time)</> },
];

const roles = [
  "I have an idea or startup",
  "I run a business and want to raise capital or sell",
  "My business needs help to recover",
  "I want to invest or buy a business",
  "I want to mentor or offer advisory services",
  "I represent a partner institution",
];

export default function ContactPage() {
  return (
    <>
      <PageHero title="Get in touch" subhead="Questions, ideas or partnerships, we would like to hear from you." />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Contact options</h2>
            <dl className="mt-6 divide-y divide-line rounded-xl border border-line">
              {options.map((o) => (
                <div key={o.label} className="flex flex-wrap justify-between gap-2 px-4 py-3">
                  <dt className="font-medium text-ink">{o.label}</dt>
                  <dd className="text-muted">{o.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6">
              <Note>
                Kenna Ventures staff will never ask for your password or ask you to send money to a personal account. Report suspicious
                messages to <a href="mailto:info@kenna.et" className="text-brand-700 hover:underline">info@kenna.et</a>.
              </Note>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Send us a message</h2>
            <PreviewForm
              formName="contact"
              className="mt-6"
              submitLabel="Send message"
              confirmation="Thank you. We have received your message and will reply within two working days."
              fields={[
                { name: "name", label: "Name", required: true },
                { name: "email", label: "Email", type: "email", required: true },
                { name: "phone", label: "Phone", type: "tel" },
                { name: "role", label: "I am a…", type: "select", options: roles, required: true },
                { name: "subject", label: "Subject", required: true },
                { name: "message", label: "Message", type: "textarea", required: true },
              ]}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
