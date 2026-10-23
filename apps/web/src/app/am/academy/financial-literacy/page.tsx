import type { Metadata } from "next";
import { CourseOverview } from "@/components/financial-literacy/CoursePages";
import { courseCopy } from "@/data/financial-literacy";

export const metadata: Metadata = {
  title: "ነፃ የፋይናንስ ዕውቀት ኮርስ · ኢንቨስቶፒያ አካዳሚ",
  description: courseCopy.am.subhead,
  alternates: { languages: { en: "/academy/financial-literacy/", am: "/am/academy/financial-literacy/" } },
};

export default function AmharicFinancialLiteracyPage() {
  return <CourseOverview locale="am" />;
}
