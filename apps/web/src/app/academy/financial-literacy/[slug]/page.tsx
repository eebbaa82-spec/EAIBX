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
    title: `${m.en.title} · Financial Literacy Course`,
    description: m.en.summary,
    alternates: { languages: { en: courseHref("en", m.slug), am: courseHref("am", m.slug) } },
  };
}

export default async function FinancialLiteracyModule({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = courseModules.find((x) => x.slug === slug);
  if (!m) notFound();
  return <ModulePage module={m} locale="en" />;
}
