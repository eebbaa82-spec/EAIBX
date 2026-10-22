import Link from "next/link";
import { Container } from "@/components/ui";
import { Icon } from "@/components/financial-literacy/Icon";
import { Visual } from "@/components/financial-literacy/Visual";
import {
  examHref,
  simulationHref,
  levelLabel,
  passMark,
  proCourseHref,
  proCourses,
  folderOf,
  folders,
  tracks,
  type FolderId,
} from "@/data/academy";
import type { ProCourse, ProLesson, ProModule } from "@/data/academy/types";
import { AcademyGate, AccessBadge } from "./Access";
import { SimulationDesk } from "./Simulation";
import {
  Certificate,
  CourseProgress,
  DoneBadge,
  FinalExam,
  ModuleQuiz,
  ScenarioCard,
} from "./Interactive";

const pad = (n: number) => String(n).padStart(2, "0");
const lessonCount = (c: ProCourse) =>
  c.modules.reduce((n, m) => n + m.lessons.length, 0);
const minutes = (c: ProCourse) => c.modules.reduce((n, m) => n + m.minutes, 0);

function Hero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 py-12 text-white sm:py-16 print:hidden">
      <Container>
        {eyebrow}
        <h1 className="mt-2 max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {children}
      </Container>
    </section>
  );
}

const folderHref = (id: FolderId) => `/academy/folders/${id}/`;
const inFolder = (f: (typeof folders)[number]) =>
  proCourses.filter((c) => f.tracks.includes(c.track));

/** The four course folders, as cards that open each folder's page. */
export function FolderCards({ current }: { current?: FolderId }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {folders.map((f) => {
        const n = inFolder(f).length;
        const on = f.id === current;
        return (
          <li key={f.id}>
            <Link
              href={folderHref(f.id)}
              aria-current={on ? "page" : undefined}
              className={`group flex h-full flex-col rounded-xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                on
                  ? "border-brand-600 bg-brand-900 text-white"
                  : "border-line bg-white hover:border-brand-500"
              }`}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  on ? "bg-gold-400 text-ink" : "bg-brand-100 text-brand-700 group-hover:bg-brand-600 group-hover:text-white"
                }`}
              >
                <Icon name={f.icon} className="h-6 w-6" />
              </span>
              <span className={`mt-3 block text-lg font-semibold ${on ? "" : "text-ink"}`}>
                {f.name}
              </span>
              <span className={`mt-1 block flex-1 text-sm ${on ? "text-brand-100" : "text-muted"}`}>
                {f.intro}
              </span>
              <span className={`mt-3 block text-sm font-semibold ${on ? "text-gold-400" : "text-brand-600"}`}>
                {n ? `${n} course${n === 1 ? "" : "s"}` : "Courses being added"}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function CourseCard({ c }: { c: ProCourse }) {
  return (
    <Link
      href={proCourseHref(c.slug)}
      className="group flex h-full flex-col rounded-xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
          <Icon name={c.icon} className="h-6 w-6" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          {levelLabel(c)}
        </span>
      </span>
      <span className="mt-3 block text-lg font-semibold text-ink">
        {c.title}
      </span>
      <span className="mt-1 block flex-1 text-muted">{c.summary}</span>
      <span className="mt-3 block text-sm text-muted">
        {c.modules.length} modules · {lessonCount(c)} lessons · final exam ·
        certificate
      </span>
    </Link>
  );
}

/** The tracks of one folder with their course cards. */
function FolderTracks({ folder: f }: { folder: (typeof folders)[number] }) {
  const shown = tracks.filter(
    (t) => f.tracks.includes(t.id) && proCourses.some((c) => c.track === t.id),
  );
  if (!shown.length) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-white p-5 text-muted">
        The courses in this folder are being prepared. Contact us to hear when they open.
      </p>
    );
  }
  return (
    <div className="space-y-10">
      {shown.map((t) => (
        <div key={t.id}>
          <h4 className="text-lg font-semibold text-ink">{t.name}</h4>
          <p className="mt-1 mb-5 max-w-3xl text-muted">{t.intro}</p>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {proCourses
              .filter((c) => c.track === t.id)
              .map((c) => (
                <li key={c.slug}>
                  <CourseCard c={c} />
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Catalog for the Academy page and the course list: the folders, then each folder's courses. */
export function ProCatalog() {
  return (
    <div className="space-y-14">
      <FolderCards />
      {folders.map((f) => (
        <div key={f.id} id={f.id} className="scroll-mt-24">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
            <h3 className="text-2xl font-bold tracking-tight text-ink">{f.name}</h3>
            <Link href={folderHref(f.id)} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              Open the folder →
            </Link>
          </div>
          <p className="mt-2 mb-6 text-sm text-muted">For {f.audience.charAt(0).toLowerCase() + f.audience.slice(1)}</p>
          <FolderTracks folder={f} />
        </div>
      ))}
    </div>
  );
}

/** One folder's page. */
export function FolderPage({ id }: { id: FolderId }) {
  const f = folders.find((x) => x.id === id)!;
  return (
    <div>
      <Hero
        eyebrow={
          <p className="flex flex-wrap items-center gap-3 text-sm font-semibold uppercase tracking-wide text-gold-400">
            <Link
              href="/academy/#catalog"
              className="text-brand-100 normal-case tracking-normal hover:text-white"
            >
              ← Investopia Academy
            </Link>
            <span>Course folder</span>
          </p>
        }
        title={f.name}
      >
        <p className="mt-4 max-w-3xl text-lg text-brand-100">{f.intro}</p>
        <p className="mt-2 text-brand-100">For {f.audience.charAt(0).toLowerCase() + f.audience.slice(1)}.</p>
      </Hero>
      <section className="bg-canvas py-12">
        <Container className="space-y-12">
          <FolderCards current={f.id} />
          <FolderTracks folder={f} />
        </Container>
      </section>
    </div>
  );
}

export function ProCourseOverview({ course: c }: { course: ProCourse }) {
  return (
    <div>
      <Hero
        eyebrow={
          <p className="flex flex-wrap items-center gap-3 text-sm font-semibold uppercase tracking-wide text-gold-400">
            <Link
              href="/academy/#catalog"
              className="text-brand-100 normal-case tracking-normal hover:text-white"
            >
              ← Investopia Academy
            </Link>
            <Link
              href={folderHref(folderOf(c).id)}
              className="normal-case tracking-normal text-brand-100 hover:text-white"
            >
              {folderOf(c).name}
            </Link>
            <span>{tracks.find((t) => t.id === c.track)!.name}</span>
            <span>{levelLabel(c)}</span>
          </p>
        }
        title={c.title}
      >
        <p className="mt-2 text-xl text-brand-100">{c.subtitle}</p>
        <p className="mt-5 max-w-3xl text-lg text-brand-100">{c.summary}</p>
        <div className="mt-6">
          <AccessBadge />
        </div>
        <div className="mt-6 max-w-xl">
          <CourseProgress course={c} />
        </div>
      </Hero>

      <section className="bg-white py-12">
        <Container className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              What you will be able to do
            </h2>
            <ul className="mt-4 space-y-2">
              {c.objectives.map((o, i) => (
                <li key={i} className="flex gap-2 text-ink">
                  <Icon
                    name="check"
                    className="mt-0.5 h-5 w-5 shrink-0 text-brand-600"
                  />
                  {o}
                </li>
              ))}
            </ul>
            {c.runningCase && (
              <aside className="mt-8 rounded-xl border-l-4 border-gold-400 bg-gold-100 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
                  The case you will follow
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {c.runningCase.name}
                </p>
                <p className="mt-2 text-ink">{c.runningCase.text}</p>
              </aside>
            )}
          </div>
          <dl className="h-fit space-y-4 rounded-xl border border-line bg-canvas p-6">
            {[
              ["For", c.audience],
              [
                "Study time",
                `About ${Math.round(minutes(c) / 60)} hours online, in ${c.modules.length} modules (${c.hours} hours in the classroom version)`,
              ],
              [
                "Each module",
                `Short lessons, animated visuals, Ethiopian examples, decisions to make, ${folderOf(c).id === "bank-and-mfi" ? "NBE rules" : "the laws and directives that apply"} and worked calculations, then a quiz`,
              ],
              [
                "Assessment",
                `A ${c.exam.length}-question final exam; pass mark ${passMark}%`,
              ],
              ["Certificate", "Investopia Academy certificate of completion"],
              [
                "Access",
                "Module 1 free for registered users; the full course, exam and certificate for subscribers",
              ],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-sm font-semibold uppercase tracking-wide text-muted">
                  {k}
                </dt>
                <dd className="mt-1 text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="bg-canvas py-12">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            The {c.modules.length} modules
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-2">
            {c.modules.map((m, i) => (
              <li key={m.id}>
                <Link
                  href={proCourseHref(c.slug, m.slug)}
                  className="group flex h-full gap-4 rounded-xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon name={m.icon} className="h-7 w-7" />
                  </span>
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
                      Module {pad(i + 1)}
                      {i === 0 && (
                        <span className="rounded-full bg-gold-100 px-2 py-0.5 text-gold-500">
                          Free preview
                        </span>
                      )}
                      <DoneBadge course={c.slug} module={m.id} />
                    </span>
                    <span className="mt-1 block text-lg font-semibold text-ink">
                      {m.title}
                    </span>
                    <span className="mt-1 block text-muted">{m.summary}</span>
                    <span className="mt-2 block text-sm text-muted">
                      {m.lessons.length} lessons · {m.minutes} min · quiz
                    </span>
                  </span>
                </Link>
              </li>
            ))}
            {c.simulation && (
              <li>
                <Link
                  href={simulationHref(c.slug)}
                  className="group flex h-full gap-4 rounded-xl border border-gold-400 bg-gold-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
                    <Icon name="bank" className="h-7 w-7" />
                  </span>
                  <span className="flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                      Officer simulation
                    </span>
                    <span className="mt-1 block text-lg font-semibold text-ink">
                      {c.simulation.title}
                    </span>
                    <span className="mt-1 block text-muted">
                      Work as {c.simulation.role.toLowerCase()}: {c.simulation.tasks.length} real-life items, decisions with consequences and a
                      hand-over note. Pass with {passMark}% to qualify for the certificate.
                    </span>
                  </span>
                </Link>
              </li>
            )}
            <li>
              <Link
                href={examHref(c.slug)}
                className="group flex h-full gap-4 rounded-xl border border-brand-600 bg-brand-900 p-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold-400 text-ink">
                  <Icon name="check" className="h-7 w-7" />
                </span>
                <span className="flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gold-400">
                    Final exam
                  </span>
                  <span className="mt-1 block text-lg font-semibold">
                    Final exam and certificate
                  </span>
                  <span className="mt-1 block text-brand-100">
                    {c.exam.length} applied questions across all {c.modules.length} modules.
                    Pass with {passMark}% to download your certificate.
                  </span>
                </span>
              </Link>
            </li>
          </ol>
        </Container>
      </section>
      <Sources course={c} />
    </div>
  );
}

function Sources({ course: c }: { course: ProCourse }) {
  return (
    <section className="border-t border-line bg-white py-8 print:hidden">
      <Container>
        <p className="text-sm font-semibold text-ink">Built on</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          {c.sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          {folderOf(c).id === "financial-management"
            ? "Examples and companies are fictional. Tax rates and rules are shown as they stood when the course was written; always check the current proclamations, directives and guidance from the Ministry of Revenues before filing, and take professional advice for your own case."
            : folderOf(c).id === "general"
              ? "Examples and organizations are fictional. Apply your own organization's approved policies."
              : "Examples and companies are fictional. Bank practices are shown as typical Ethiopian practice, not as any one bank's policy. Always apply your own institution's approved policy and the current NBE directives."}
        </p>
      </Container>
    </section>
  );
}

function LessonView({ l, number }: { l: ProLesson; number: string }) {
  return (
    <section
      id={l.id}
      className="scroll-mt-24 border-b border-line py-10 last:border-0"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
        {number}
      </p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">
        {l.title}
      </h2>
      <div className="mt-4 space-y-4 text-lg leading-relaxed text-ink">
        {l.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {l.points && (
        <ul className="mt-4 space-y-2">
          {l.points.map((p, i) => (
            <li key={i} className="flex gap-3 text-lg text-ink">
              <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-gold-500" />
              {p}
            </li>
          ))}
        </ul>
      )}
      {l.visual && <Visual data={l.visual} />}
      {l.regulation && (
        <aside className="mt-6 flex gap-4 rounded-xl border border-brand-200 bg-brand-50 p-5">
          <Icon name="scale" className="h-7 w-7 shrink-0 text-brand-700" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              Rule to know
            </p>
            <p className="mt-1 font-semibold text-ink">{l.regulation.source}</p>
            <p className="mt-2 text-ink">{l.regulation.text}</p>
          </div>
        </aside>
      )}
      {l.worked && (
        <figure className="mt-6 overflow-hidden rounded-xl border border-line">
          <figcaption className="flex items-center gap-2 bg-ink px-5 py-3 font-semibold text-white">
            <Icon name="calculator" className="h-5 w-5 text-gold-400" />
            {l.worked.title}
          </figcaption>
          <table className="w-full text-left">
            <tbody>
              {l.worked.rows.map((r, i) => (
                <tr key={i} className="border-t border-line odd:bg-canvas">
                  <th scope="row" className="px-5 py-2 font-normal text-ink">
                    {r.label}
                  </th>
                  <td className="px-5 py-2 text-right font-semibold tabular-nums text-ink">
                    {r.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {l.worked.note && (
            <p className="border-t border-line bg-gold-100 px-5 py-3 text-ink">
              {l.worked.note}
            </p>
          )}
        </figure>
      )}
      {l.example && (
        <aside className="mt-6 rounded-xl border-l-4 border-brand-500 bg-canvas p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Real-life example
          </p>
          <p className="mt-1 font-semibold text-ink">{l.example.title}</p>
          <p className="mt-2 text-ink">{l.example.text}</p>
        </aside>
      )}
      {l.scenario && <ScenarioCard s={l.scenario} />}
      {l.tip && (
        <p className="mt-6 flex gap-3 rounded-xl bg-gold-100 p-4 text-ink">
          <Icon name="idea" className="h-6 w-6 shrink-0 text-gold-500" />
          <span>
            <strong>Practice tip:</strong> {l.tip}
          </span>
        </p>
      )}
    </section>
  );
}

export function ProModulePage({
  course: c,
  module: m,
}: {
  course: ProCourse;
  module: ProModule;
}) {
  const index = c.modules.findIndex((x) => x.id === m.id);
  const prev = c.modules[index - 1];
  const next = c.modules[index + 1];
  return (
    <div>
      <Hero
        eyebrow={
          <Link
            href={proCourseHref(c.slug)}
            className="text-sm font-semibold text-brand-100 hover:text-white"
          >
            ← {c.title}
          </Link>
        }
        title={m.title}
      >
        <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-gold-400">
          Module {pad(index + 1)} / {c.modules.length} · {m.minutes} min{" "}
          {index === 0 && "· Free preview"}
        </p>
        <p className="mt-3 max-w-3xl text-lg text-brand-100">{m.summary}</p>
      </Hero>

      <Container className="grid gap-10 py-12 lg:grid-cols-[16rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav
            aria-label="In this module"
            className="rounded-xl border border-line bg-canvas p-4"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">
              In this module
            </p>
            <ol className="mt-3 space-y-2 text-sm">
              {m.lessons.map((l, i) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    className="flex gap-2 text-ink hover:text-brand-700"
                  >
                    <span className="font-semibold text-brand-600">
                      {i + 1}.
                    </span>
                    {l.title}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#quiz"
                  className="flex gap-2 text-ink hover:text-brand-700"
                >
                  <span className="font-semibold text-brand-600">✓</span>
                  Module quiz
                </a>
              </li>
            </ol>
          </nav>
        </aside>

        <article className="min-w-0 max-w-3xl">
          <section className="rounded-xl border border-gold-400 bg-gold-100 p-5">
            <h2 className="font-semibold text-ink">
              In this module you will learn to
            </h2>
            <ul className="mt-2 space-y-1.5">
              {m.objectives.map((o, i) => (
                <li key={i} className="flex gap-2 text-ink">
                  <Icon
                    name="check"
                    className="mt-0.5 h-5 w-5 shrink-0 text-brand-600"
                  />
                  {o}
                </li>
              ))}
            </ul>
          </section>

          <AcademyGate need={index === 0 ? "preview" : "full"} course={c.slug}>
            {m.lessons.map((l, i) => (
              <LessonView
                key={l.id}
                l={l}
                number={`${pad(index + 1)}.${i + 1}`}
              />
            ))}
            <section className="mt-6 rounded-2xl bg-brand-900 p-6 text-white">
              <h2 className="text-xl font-bold">Key points to remember</h2>
              <ul className="mt-4 space-y-2">
                {m.takeaways.map((k, i) => (
                  <li key={i} className="flex gap-3">
                    <Icon
                      name="check"
                      className="mt-0.5 h-5 w-5 shrink-0 text-gold-400"
                    />
                    {k}
                  </li>
                ))}
              </ul>
            </section>
            <section id="quiz" className="scroll-mt-24 py-10">
              <h2 className="text-2xl font-bold tracking-tight text-ink">
                Module quiz
              </h2>
              <div className="mt-4">
                <ModuleQuiz course={c.slug} module={m.id} questions={m.quiz} />
              </div>
            </section>
          </AcademyGate>

          <nav
            className="mt-8 grid gap-3 border-t border-line pt-6 sm:grid-cols-2"
            aria-label="Modules"
          >
            {prev ? (
              <Link
                href={proCourseHref(c.slug, prev.slug)}
                className="rounded-xl border border-line p-4 hover:border-brand-500"
              >
                <span className="text-sm text-muted">← Previous module</span>
                <span className="mt-1 block font-semibold text-ink">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <Link
                href={proCourseHref(c.slug)}
                className="rounded-xl border border-line p-4 hover:border-brand-500"
              >
                <span className="text-sm text-muted">← Course overview</span>
                <span className="mt-1 block font-semibold text-ink">
                  {c.title}
                </span>
              </Link>
            )}
            <Link
              href={next ? proCourseHref(c.slug, next.slug) : c.simulation ? simulationHref(c.slug) : examHref(c.slug)}
              className="rounded-xl bg-brand-600 p-4 text-right text-white hover:bg-brand-700"
            >
              <span className="text-sm text-brand-100">
                {next ? "Next module" : c.simulation ? "Officer simulation" : "Final exam"} →
              </span>
              <span className="mt-1 block font-semibold">
                {next ? next.title : c.simulation ? c.simulation.title : "Final exam and certificate"}
              </span>
            </Link>
          </nav>
        </article>
      </Container>
      <Sources course={c} />
    </div>
  );
}

export function ProSimulationPage({ course: c }: { course: ProCourse }) {
  const sim = c.simulation!;
  return (
    <div>
      <div className="print:hidden">
        <Hero
          eyebrow={
            <Link href={proCourseHref(c.slug)} className="text-sm font-semibold text-brand-100 hover:text-white">
              ← {c.title}
            </Link>
          }
          title="Officer simulation"
        >
          <p className="mt-3 max-w-3xl text-lg text-brand-100">
            {sim.title}. Handle each item as it reaches your desk, using what you learned in the {c.modules.length} modules. Your choices have consequences later.
          </p>
        </Hero>
      </div>
      <Container className="py-12 print:max-w-none print:p-0">
        <AcademyGate need="full" course={c.slug}>
          <SimulationDesk course={c} />
        </AcademyGate>
      </Container>
    </div>
  );
}

export function ProExamPage({ course: c }: { course: ProCourse }) {
  return (
    <div>
      <Hero
        eyebrow={
          <Link
            href={proCourseHref(c.slug)}
            className="text-sm font-semibold text-brand-100 hover:text-white"
          >
            ← {c.title}
          </Link>
        }
        title="Final exam"
      >
        <p className="mt-3 max-w-3xl text-lg text-brand-100">
          {c.exam.length} applied questions across all {c.modules.length} modules. Answers are
          shown after you submit. Pass with {passMark}% or more to download your
          certificate of completion.
        </p>
      </Hero>
      <Container className="max-w-3xl py-12 print:max-w-none print:p-0">
        <AcademyGate need="full" course={c.slug}>
          <FinalExam course={c} />
          <Certificate course={c} />
        </AcademyGate>
      </Container>
    </div>
  );
}
