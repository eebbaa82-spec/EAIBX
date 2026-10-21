import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProModulePage } from "@/components/academy/CoursePages";
import { proCourses } from "@/data/academy";

export const dynamicParams = false;

export function generateStaticParams() {
  return proCourses.flatMap((c) => c.modules.map((m) => ({ course: c.slug, module: m.slug })));
}

function find(course: string, module: string) {
  const c = proCourses.find((x) => x.slug === course);
  const m = c?.modules.find((x) => x.slug === module);
  return c && m ? { c, m } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ course: string; module: string }> }): Promise<Metadata> {
  const { course, module } = await params;
  const f = find(course, module);
  return f ? { title: `${f.m.title} · ${f.c.title} · Investopia Academy`, description: f.m.summary } : {};
}

export default async function ProModule({ params }: { params: Promise<{ course: string; module: string }> }) {
  const { course, module } = await params;
  const f = find(course, module);
  if (!f) notFound();
  return <ProModulePage course={f.c} module={f.m} />;
}
