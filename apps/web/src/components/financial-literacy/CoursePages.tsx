import Link from "next/link";
import { Container } from "@/components/ui";
import { courseCopy, courseHref, courseModules, type CourseLocale } from "@/data/financial-literacy";
import type { CourseModule } from "@/data/financial-literacy/types";
import { Icon } from "./Icon";
import { DoneBadge, ProgressBar } from "./Progress";
import { Quiz } from "./Quiz";
import { Visual } from "./Visual";

const pad = (n: number) => String(n).padStart(2, "0");

function LanguageLink({ locale, slug }: { locale: CourseLocale; slug?: string }) {
  const other: CourseLocale = locale === "en" ? "am" : "en";
  return (
    <Link href={courseHref(other, slug)} lang={other} hrefLang={other} className="text-sm font-semibold text-gold-400 underline-offset-4 hover:underline">
      {courseCopy[locale].otherLanguage}
    </Link>
  );
}

/** The formal declaration and credits, shown in full on the course overview. */
function Credits({ locale }: { locale: CourseLocale }) {
  const c = courseCopy[locale].credits;
  return (
    <section id="credits" className="scroll-mt-24 border-t border-line bg-canvas py-12">
      <Container className="max-w-4xl">
        <h2 className="text-xl font-bold text-ink">{c.title}</h2>
        <div className="mt-4 space-y-3 text-ink">
          {c.declaration.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <h3 className="mt-8 font-semibold text-ink">{c.institutionsTitle}</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {c.institutions.map((x) => (
            <li key={x.name} className="rounded-xl border border-line bg-white p-4">
              <p className="font-semibold text-ink">{x.name}</p>
              <p className="mt-1 text-sm text-muted">{x.role}</p>
            </li>
          ))}
        </ul>
        <h3 className="mt-8 font-semibold text-ink">{c.prefaceTitle}</h3>
        <ul className="mt-3 space-y-1 text-ink">
          {c.preface.map((x) => (
            <li key={x.name}>
              <span lang="en" className="font-semibold">
                {x.name}
              </span>
              , {x.role}
            </li>
          ))}
        </ul>
        <h3 className="mt-8 font-semibold text-ink">{c.referencesTitle}</h3>
        <p lang="en" className="mt-2 text-sm text-muted">
          {c.references}
        </p>
        <p className="mt-6 text-sm text-muted">{c.original}</p>
      </Container>
    </section>
  );
}

/** A short credit on every module page, pointing to the full declaration. */
function Source({ locale }: { locale: CourseLocale }) {
  const t = courseCopy[locale];
  return (
    <section className="border-t border-line bg-canvas py-8">
      <Container>
        <p className="text-sm text-muted">
          {t.source}{" "}
          <Link href={`${courseHref(locale)}#credits`} className="font-semibold text-brand-700 hover:underline">
            {t.seeCredits}
          </Link>
        </p>
      </Container>
    </section>
  );
}

/** The ten modules as a winding path: the course at a glance. */
function JourneyArt() {
  const points = [
    [30, 210], [90, 170], [60, 110], [130, 70], [200, 100], [250, 160], [320, 190], [370, 130], [330, 70], [400, 30],
  ];
  const d = points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  return (
    <svg viewBox="0 0 430 240" className="fl-float h-auto w-full max-w-md" aria-hidden="true">
      <path d={d} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeDasharray="6 8" strokeLinecap="round" />
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === 9 ? 18 : 14} fill={i === 9 ? "var(--color-gold-400)" : "white"} opacity={i === 9 ? 1 : 0.95} />
          <text x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--color-brand-700)">
            {i === 9 ? "★" : i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function CourseOverview({ locale }: { locale: CourseLocale }) {
  const t = courseCopy[locale];
  return (
    <div lang={locale}>
      <section className="overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 py-14 text-white sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-[3fr_2fr]">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold-400">{t.eyebrow}</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{t.title}</h1>
            <p className="mt-5 max-w-2xl text-lg text-brand-100 sm:text-xl">{t.subhead}</p>
            <div className="mt-8 max-w-xl">
              <ProgressBar locale={locale} />
            </div>
            <p className="mt-6">
              <LanguageLink locale={locale} />
            </p>
          </div>
          <div className="hidden justify-center lg:flex">
            <JourneyArt />
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t.howTitle}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {t.how.map((h, i) => (
              <li key={i} className="rounded-xl border border-line p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{i + 1}</span>
                <p className="mt-3 font-semibold text-ink">{h.title}</p>
                <p className="mt-1 text-muted">{h.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-canvas py-14">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t.modules}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-2">
            {courseModules.map((m, i) => (
              <li key={m.id}>
                <Link
                  href={courseHref(locale, m.slug)}
                  className="group flex h-full gap-4 rounded-xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon name={m.icon} className="h-7 w-7" />
                  </span>
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
                      {t.module} {pad(i + 1)}
                      <DoneBadge id={m.id} locale={locale} />
                    </span>
                    <span className="mt-1 block text-lg font-semibold text-ink">{m[locale].title}</span>
                    <span className="mt-1 block text-muted">{m[locale].summary}</span>
                    <span className="mt-2 block text-sm text-muted">
                      {m[locale].lessons.length} {t.lessons} · {m.minutes} {t.minutes}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <Credits locale={locale} />
    </div>
  );
}

export function ModulePage({ module: m, locale }: { module: CourseModule; locale: CourseLocale }) {
  const t = courseCopy[locale];
  const c = m[locale];
  const index = courseModules.findIndex((x) => x.id === m.id);
  const prev = courseModules[index - 1];
  const next = courseModules[index + 1];

  return (
    <div lang={locale}>
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 py-12 text-white sm:py-16">
        <Container>
          <Link href={courseHref(locale)} className="text-sm font-semibold text-brand-100 hover:text-white">
            ← {t.title}
          </Link>
          <div className="mt-6 flex items-start gap-5">
            <span className="fl-float hidden h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/10 text-gold-400 sm:flex">
              <Icon name={m.icon} className="h-11 w-11" />
            </span>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold-400">
                {t.module} {pad(index + 1)} / {courseModules.length} · {m.minutes} {t.minutes}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{c.title}</h1>
              <p className="mt-4 text-lg text-brand-100">{c.summary}</p>
              <p className="mt-4">
                <LanguageLink locale={locale} slug={m.slug} />
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Container className="grid gap-10 py-12 lg:grid-cols-[16rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label={t.contents} className="rounded-xl border border-line bg-canvas p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">{t.contents}</p>
            <ol className="mt-3 space-y-2 text-sm">
              {c.lessons.map((l, i) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="flex gap-2 text-ink hover:text-brand-700">
                    <span className="font-semibold text-brand-600">{i + 1}.</span>
                    {l.title}
                  </a>
                </li>
              ))}
              <li>
                <a href="#quiz" className="flex gap-2 text-ink hover:text-brand-700">
                  <span className="font-semibold text-brand-600">✓</span>
                  {t.quiz}
                </a>
              </li>
            </ol>
          </nav>
        </aside>

        <article className="min-w-0 max-w-3xl">
          <section className="rounded-xl border border-gold-400 bg-gold-100 p-5">
            <h2 className="font-semibold text-ink">{t.objectives}</h2>
            <ul className="mt-2 space-y-1.5">
              {c.objectives.map((o, i) => (
                <li key={i} className="flex gap-2 text-ink">
                  <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  {o}
                </li>
              ))}
            </ul>
          </section>

          {c.lessons.map((l, i) => (
            <section key={l.id} id={l.id} className="scroll-mt-24 border-b border-line py-10 last:border-0">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                {pad(index + 1)}.{i + 1}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">{l.title}</h2>
              <div className="mt-4 space-y-4 text-lg leading-relaxed text-ink">
                {l.body.map((p, pi) => (
                  <p key={pi}>{p}</p>
                ))}
              </div>
              {l.points && (
                <ul className="mt-4 space-y-2">
                  {l.points.map((p, pi) => (
                    <li key={pi} className="flex gap-3 text-lg text-ink">
                      <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-gold-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              )}
              {l.visual && <Visual data={l.visual} />}
              {l.example && (
                <aside className="mt-6 rounded-xl border-l-4 border-brand-500 bg-canvas p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{t.example}</p>
                  <p className="mt-1 font-semibold text-ink">{l.example.title}</p>
                  <p className="mt-2 text-ink">{l.example.text}</p>
                </aside>
              )}
              {l.tip && (
                <p className="mt-6 flex gap-3 rounded-xl bg-gold-100 p-4 text-ink">
                  <Icon name="idea" className="h-6 w-6 shrink-0 text-gold-500" />
                  <span>
                    <strong>{t.tip}:</strong> {l.tip}
                  </span>
                </p>
              )}
            </section>
          ))}

          <section className="mt-6 rounded-2xl bg-brand-900 p-6 text-white">
            <h2 className="text-xl font-bold">{t.takeaways}</h2>
            <ul className="mt-4 space-y-2">
              {c.takeaways.map((k, i) => (
                <li key={i} className="flex gap-3">
                  <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-gold-400" />
                  {k}
                </li>
              ))}
            </ul>
          </section>

          <section id="quiz" className="scroll-mt-24 py-10">
            <h2 className="text-2xl font-bold tracking-tight text-ink">{t.quiz}</h2>
            <div className="mt-4">
              <Quiz moduleId={m.id} questions={c.quiz} locale={locale} />
            </div>
          </section>

          <nav className="grid gap-3 border-t border-line pt-6 sm:grid-cols-2" aria-label={t.modules}>
            {prev ? (
              <Link href={courseHref(locale, prev.slug)} className="rounded-xl border border-line p-4 hover:border-brand-500">
                <span className="text-sm text-muted">← {t.previous}</span>
                <span className="mt-1 block font-semibold text-ink">{prev[locale].title}</span>
              </Link>
            ) : (
              <Link href={courseHref(locale)} className="rounded-xl border border-line p-4 hover:border-brand-500">
                <span className="text-sm text-muted">← {t.backToCourse}</span>
                <span className="mt-1 block font-semibold text-ink">{t.title}</span>
              </Link>
            )}
            {next ? (
              <Link href={courseHref(locale, next.slug)} className="rounded-xl bg-brand-600 p-4 text-right text-white hover:bg-brand-700">
                <span className="text-sm text-brand-100">{t.next} →</span>
                <span className="mt-1 block font-semibold">{next[locale].title}</span>
              </Link>
            ) : (
              <Link href={courseHref(locale)} className="rounded-xl bg-brand-600 p-4 text-right text-white hover:bg-brand-700">
                <span className="text-sm text-brand-100">{t.backToCourse} →</span>
                <span className="mt-1 block font-semibold">{t.title}</span>
              </Link>
            )}
          </nav>
        </article>
      </Container>
      <Source locale={locale} />
    </div>
  );
}
