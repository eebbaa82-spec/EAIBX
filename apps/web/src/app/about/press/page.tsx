import type { Metadata } from "next";
import { Card, CardGrid, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Press and Media · Erudite Africa Connect",
  description: "News, announcements and media resources about Erudite Africa Connect.",
};

export default function PressPage() {
  return (
    <>
      <PageHero eyebrow="Press" title="Press and media" subhead="News, announcements and media resources about Erudite Africa Connect." />
      <Section title="Boilerplate" intro="For press releases.">
        <blockquote className="max-w-3xl rounded-xl border-l-4 border-brand-600 bg-canvas p-6 text-ink">
          Erudite Africa Connect (&ldquo;Powering Smarter Business Decisions&rdquo;) is a digital platform that connects Ethiopian
          entrepreneurs, businesses and investors across the full business lifecycle, from incubation and investment to
          diagnostics, recovery and exit. Erudite Africa Connect is operated by Erudite Africa Investments PLC, headquartered in Addis Ababa.
          Learn more at connect.eruditeafrica.et.
        </blockquote>
      </Section>
      <Section tone="canvas">
        <CardGrid cols={2}>
          <Card title="Media contact">
            <a href="mailto:connect@eruditeafrica.com" className="text-brand-700 hover:underline">connect@eruditeafrica.com</a>
          </Card>
          <Card title="Download">Brand kit (logos, colors, photos)</Card>
        </CardGrid>
      </Section>
    </>
  );
}
