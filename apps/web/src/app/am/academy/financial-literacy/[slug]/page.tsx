import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModulePage } from "@/components/financial-literacy/CoursePages";
import { courseHref, courseModules } from "@/data/financial-literacy";

export const dynamicParams = false;

export function generateStaticParams() {
  return courseModules.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = courseModules.find((x) => x.slug === slug);
  if (!m) return {};
  return {
    title: `${m.am.title} · የፋይናንስ ዕውቀት ኮርስ`,
    description: m.am.summary,
    alternates: { languages: { en: courseHref("en", m.slug), am: courseHref("am", m.slug) } },
  };
}

export default async function AmharicFinancialLiteracyModule({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = courseModules.find((x) => x.slug === slug);
  if (!m) notFound();
  return <ModulePage module={m} locale="am" />;
}
