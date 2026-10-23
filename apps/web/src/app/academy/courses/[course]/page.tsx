import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProCourseOverview } from "@/components/academy/CoursePages";
import { proCourses } from "@/data/academy";

export const dynamicParams = false;

export function generateStaticParams() {
  return proCourses.map((c) => ({ course: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }): Promise<Metadata> {
  const { course } = await params;
  const c = proCourses.find((x) => x.slug === course);
  return c ? { title: `${c.title} · Investopia Academy`, description: c.summary } : {};
}

export default async function ProCoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course } = await params;
  const c = proCourses.find((x) => x.slug === course);
  if (!c) notFound();
  return <ProCourseOverview course={c} />;
}
