import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProExamPage } from "@/components/academy/CoursePages";
import { proCourses } from "@/data/academy";

export const dynamicParams = false;

export function generateStaticParams() {
  return proCourses.map((c) => ({ course: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }): Promise<Metadata> {
  const { course } = await params;
  const c = proCourses.find((x) => x.slug === course);
  return c ? { title: `Final exam · ${c.title} · Investopia Academy`, description: `Final exam and certificate for ${c.title}.` } : {};
}

export default async function ProExam({ params }: { params: Promise<{ course: string }> }) {
  const { course } = await params;
  const c = proCourses.find((x) => x.slug === course);
  if (!c) notFound();
  return <ProExamPage course={c} />;
}
