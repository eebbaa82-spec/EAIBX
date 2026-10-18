import type { Metadata } from "next";
import { Card, CardGrid, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Press and Media · Kena Hub",
  description: "News, announcements and media resources about Kena Hub.",
};

export default function PressPage() {
  return (
    <>
      <PageHero eyebrow="Press" title="Press and media" subhead="News, announcements and media resources about Kena Hub." />
      <Section title="Boilerplate" intro="For press releases.">
        <blockquote className="max-w-3xl rounded-xl border-l-4 border-brand-600 bg-canvas p-6 text-ink">
          Kena Hub (&ldquo;Building Trust in Every Deal&rdquo;) is a digital platform that connects Ethiopian
          entrepreneurs, businesses and investors across the full business lifecycle, from incubation and investment to
          diagnostics, recovery and exit. Kena Hub is operated by Erudite Africa Investments PLC, headquartered in Addis Ababa.
          Learn more at ebba.et.
        </blockquote>
      </Section>
      <Section tone="canvas">
        <CardGrid cols={2}>
          <Card title="Media contact">
            <a href="mailto:contact@ebba.et" className="text-brand-700 hover:underline">contact@ebba.et</a>
          </Card>
          <Card title="Download">Brand kit (logos, colors, photos)</Card>
        </CardGrid>
      </Section>
    </>
  );
}
