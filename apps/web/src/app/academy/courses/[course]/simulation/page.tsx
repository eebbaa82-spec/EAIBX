import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProSimulationPage } from "@/components/academy/CoursePages";
import { proCourses, simName } from "@/data/academy";

export const dynamicParams = false;

export function generateStaticParams() {
  return proCourses.filter((c) => c.simulation).map((c) => ({ course: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }): Promise<Metadata> {
  const { course } = await params;
  const c = proCourses.find((x) => x.slug === course);
  return c?.simulation ? { title: `${simName(c)} · ${c.title} · Erudite Africa Center of Excellence`, description: c.simulation.title } : {};
}

export default async function ProSimulation({ params }: { params: Promise<{ course: string }> }) {
  const { course } = await params;
  const c = proCourses.find((x) => x.slug === course);
  if (!c?.simulation) notFound();
  return <ProSimulationPage course={c} />;
}
