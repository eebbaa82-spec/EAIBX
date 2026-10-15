import type { Metadata } from "next";
import { Note, PageHero, Section, Tbc } from "@/components/ui";

const intro =
  "Our team brings together investment professionals, turnaround specialists, technologists and educators who share one belief: Ethiopian business deserves world-class infrastructure.";

export const metadata: Metadata = {
  title: "Our Team · EABIX",
  description: "Investment professionals, turnaround specialists, technologists and educators building world-class infrastructure for Ethiopian business.",
};

// Names, titles and bios from the Erudite Africa Investments PLC corporate profile (2026).
const leader = {
  name: "Befikadu Eba",
  title: "Managing Director and Founder",
  bio: "A strategic economist and investment leader with a background in banking and credit risk. He holds an M.Sc. in Financial Economics and an MA in Public Financial Management, and is a PhD candidate. His work spans corporate finance, mergers and acquisitions, investment advisory, due diligence and strategic partnerships.",
};

const managers = [
  {
    name: "Ephrem Tekle (PhD)",
    title: "Research and Consulting Manager",
    bio: "A research and consultancy leader who designs and manages high-impact, multi-stakeholder projects, notably in education, from diagnostic studies to scalable, evidence-based interventions.",
  },
  {
    name: "Belayneh Bogale",
    title: "Manager, Training and Development Division",
    bio: "Over a decade in higher education, organizational development and leadership training. Holds a Master's in Public Management and Policy, with certifications in project management and financial markets.",
  },
  {
    name: "Isa Abraham",
    title: "Manager, Turnaround Management & Investments Division",
    bio: "A business transformation and investment professional focused on corporate turnaround, restructuring, venture incubation and investment facilitation, including impact investment and Islamic finance.",
  },
  {
    name: "Esayas Ayele",
    title: "Investment Manager",
    bio: "A senior consultant with over a decade of hands-on experience in logistics and supply chain, project management and policy formulation, with a background in Economics and Supply Chain Management.",
  },
  {
    name: "Hiwot Belachew",
    title: "Manager, Corporate Services",
    bio: "Manages the firm's operational backbone across organizational management, compliance, finance and human resources, and is the liaison with the professionals in our network.",
  },
  {
    name: "Ashenafi Mengistu",
    title: "Manager, Market Intelligence",
    bio: "Leads the Market Intelligence practice. An MBA holder specializing in due diligence support, sector-wide opportunity scanning and competitive benchmarking for investors and corporations.",
  },
];

function initials(name: string) {
  return name
    .replace(/\(.*\)/, "")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function Profile({ person, large = false }: { person: typeof leader; large?: boolean }) {
  return (
    <article className={`flex gap-5 rounded-xl border border-line bg-white p-6 shadow-sm ${large ? "md:p-8" : ""}`}>
      <div
        aria-hidden
        className={`flex flex-none items-center justify-center rounded-full bg-brand-600 font-bold text-white ${large ? "h-20 w-20 text-2xl" : "h-14 w-14 text-lg"}`}
      >
        {initials(person.name)}
      </div>
      <div>
        <h3 className={`font-semibold text-ink ${large ? "text-xl" : "text-lg"}`}>{person.name}</h3>
        <p className="text-sm font-medium text-brand-700">{person.title}</p>
        <p className="mt-2 text-muted">{person.bio}</p>
      </div>
    </article>
  );
}

export default function TeamPage() {
  return (
    <>
      <PageHero eyebrow="Our team" title="The people behind EABIX" subhead={intro} />
      <Section title="Leadership">
        <Profile person={leader} large />
      </Section>
      <Section title="Management team" tone="canvas">
        <div className="grid gap-6 md:grid-cols-2">
          {managers.map((m) => (
            <Profile key={m.name} person={m} />
          ))}
        </div>
        <p className="mt-6 text-muted">
          The management team is supported by a wider network of associate consultants and subject specialists engaged as each
          assignment requires.
        </p>
      </Section>
      <Section>
        <Note>
          <Tbc>photos and LinkedIn links for each profile, plus board and advisory council members if they will be listed</Tbc>
        </Note>
      </Section>
    </>
  );
}
