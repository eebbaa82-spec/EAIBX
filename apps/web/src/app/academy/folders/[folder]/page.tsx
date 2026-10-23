import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FolderPage } from "@/components/academy/CoursePages";
import { folders } from "@/data/academy";

type Props = { params: Promise<{ folder: string }> };

export function generateStaticParams() {
  return folders.map((f) => ({ folder: f.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { folder } = await params;
  const f = folders.find((x) => x.id === folder);
  return f
    ? { title: `${f.name} courses · Investopia Academy`, description: f.intro }
    : {};
}

export default async function FolderRoute({ params }: Props) {
  const { folder } = await params;
  const f = folders.find((x) => x.id === folder);
  if (!f) notFound();
  return <FolderPage id={f.id} />;
}
