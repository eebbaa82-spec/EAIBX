import type { Metadata } from "next";
import { Card, CardGrid, PageHero, Section, Tbc } from "@/components/ui";

export const metadata: Metadata = {
  title: "Press and Media · EABIX",
  description: "News, announcements and media resources about EABIX.",
};

export default function PressPage() {
  return (
    <>
      <PageHero eyebrow="Press" title="Press and media" subhead="News, announcements and media resources about EABIX." />
      <Section title="Boilerplate" intro="For press releases.">
        <blockquote className="max-w-3xl rounded-xl border-l-4 border-brand-600 bg-canvas p-6 text-ink">
          EABIX, the Erudite Africa Business &amp; Investment Exchange, is a digital platform that connects Ethiopian
          entrepreneurs, businesses and investors across the full business lifecycle, from incubation and investment to
          diagnostics, recovery and exit. EABIX is operated by Erudite Africa Investments PLC, headquartered in Addis Ababa.
          Learn more at <Tbc>domain</Tbc>.
        </blockquote>
      </Section>
      <Section tone="canvas">
        <CardGrid cols={2}>
          <Card title="Media contact">
            <Tbc>name, email, phone</Tbc>
          </Card>
          <Card title="Download">Brand kit (logos, colors, photos)</Card>
        </CardGrid>
      </Section>
    </>
  );
}
