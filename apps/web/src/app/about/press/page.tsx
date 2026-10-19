import type { Metadata } from "next";
import { Card, CardGrid, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Press and Media · Investopia",
  description: "News, announcements and media resources about Investopia.",
};

export default function PressPage() {
  return (
    <>
      <PageHero eyebrow="Press" title="Press and media" subhead="News, announcements and media resources about Investopia." />
      <Section title="Boilerplate" intro="For press releases.">
        <blockquote className="max-w-3xl rounded-xl border-l-4 border-brand-600 bg-canvas p-6 text-ink">
          Investopia (&ldquo;Powering Smarter Business Decisions&rdquo;) is a digital platform that connects Ethiopian
          entrepreneurs, businesses and investors across the full business lifecycle, from incubation and investment to
          diagnostics, recovery and exit. Investopia is operated by Erudite Africa Investments PLC, headquartered in Addis Ababa.
          Learn more at investopia.et.
        </blockquote>
      </Section>
      <Section tone="canvas">
        <CardGrid cols={2}>
          <Card title="Media contact">
            <a href="mailto:investopia@eruditeafrica.com" className="text-brand-700 hover:underline">investopia@eruditeafrica.com</a>
          </Card>
          <Card title="Download">Brand kit (logos, colors, photos)</Card>
        </CardGrid>
      </Section>
    </>
  );
}
