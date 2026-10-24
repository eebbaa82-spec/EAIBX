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
  TrustBar,
} from "@/components/ui";
import { translator } from "@/i18n/chrome";
import { localizeHref, type Locale } from "@/i18n/config";
import { brand } from "@/lib/site";
import type { HomeCopy } from "@/i18n/home";

export function HomePage({ t, locale }: { t: HomeCopy; locale: Locale }) {
  const href = (h: string) => localizeHref(locale, h);
  const tc = translator(locale);
  return (
    <>
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 py-20 text-white sm:py-28">
        <Container>
          <div className="max-w-3xl">
            <p className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{brand.name}</p>
            <p className="mt-1 text-sm font-medium text-gold-400 sm:text-base">{tc(`A platform by ${brand.operator}.`)}</p>
            <h1 className="mt-8 text-4xl font-extrabold tracking-tight sm:text-6xl">{t.heroTitle}</h1>
            <p className="mt-6 text-lg text-brand-100 sm:text-xl">{t.heroBody}</p>
            <form action="/marketplace/" className="mt-8 flex max-w-2xl gap-2" role="search">
              <label htmlFor="hero-search" className="sr-only">
                {t.searchLabel}
              </label>
              <input
                id="hero-search"
                name="q"
                type="search"
                placeholder={t.searchPlaceholder}
                className="w-full rounded-lg border-0 px-4 py-3 text-ink placeholder:text-muted"
              />
              <button type="submit" className="rounded-lg bg-gold-500 px-5 py-3 font-semibold text-ink hover:bg-gold-400">
                {t.searchButton}
              </button>
            </form>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={href("/for-entrepreneurs")} variant="light">
                {t.heroButtons[0]}
              </ButtonLink>
              <ButtonLink href={href("/for-investors")} variant="light">
                {t.heroButtons[1]}
              </ButtonLink>
              <ButtonLink href={href("/recovery")} variant="light">
                {t.heroButtons[2]}
              </ButtonLink>
            </div>
            <p className="mt-6 text-sm text-brand-100">{t.heroNote}</p>
          </div>
        </Container>
      </section>

      <div className="border-b border-line bg-white py-6">
        <Container>
          <p className="text-center text-sm font-medium text-muted">{t.foundingNote}</p>
        </Container>
      </div>

      <Section title={t.pathsTitle}>
        <CardGrid cols={4}>
          {t.paths.map((p) => (
            <Card
              key={p.href}
              title={
                <>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">{p.audience}</span>
                  {p.heading}
                </>
              }
              footer={
                <Link href={href(p.href)} className="font-semibold text-brand-700 hover:underline">
                  {p.link} →
                </Link>
              }
            >
              {p.body}
            </Card>
          ))}
        </CardGrid>
      </Section>

      <TrustBar locale={locale} />

      <Section title={t.howTitle} tone="canvas">
        <Steps steps={t.howSteps} />
        <div className="mt-8">
          <ButtonLink href={href("/how-it-works")}>{t.howButton}</ButtonLink>
        </div>
      </Section>

      <Section title={t.oppTitle} intro={t.oppIntro}>
        <EmptyState action={<ButtonLink href={href("/marketplace")} variant="secondary">{t.oppButton}</ButtonLink>}>
          {t.oppEmpty}
        </EmptyState>
      </Section>

      <Section title={t.whyTitle} tone="canvas">
        <FeatureList items={t.whyItems} />
      </Section>

      <Section title={t.programsTitle} intro={t.programsIntro}>
        <EmptyState action={<ButtonLink href={href("/programs")} variant="secondary">{t.programsButton}</ButtonLink>}>
          {t.programsEmpty}
        </EmptyState>
      </Section>

      <Section title={t.partnerTitle} tone="canvas">
        <p className="max-w-3xl text-lg text-muted">{t.partnerBody}</p>
        <div className="mt-6">
          <ButtonLink href={href("/partners")} variant="secondary">{t.partnerButton}</ButtonLink>
        </div>
      </Section>

      <CtaBand title={t.ctaTitle} body={t.ctaBody}>
        <ButtonLink href={href("/join")} variant="light">
          {t.ctaJoin}
        </ButtonLink>
        <ButtonLink href={href("/contact")} variant="ghost" className="text-white">
          {t.ctaTalk}
        </ButtonLink>
      </CtaBand>
    </>
  );
}
