import type { Metadata } from "next";
import { CourseOverview } from "@/components/financial-literacy/CoursePages";
import { courseCopy } from "@/data/financial-literacy";

export const metadata: Metadata = {
  title: "Free Financial Literacy Course · Investopia Academy",
  description: courseCopy.en.subhead,
  alternates: { languages: { en: "/academy/financial-literacy/", am: "/am/academy/financial-literacy/" } },
};

export default function FinancialLiteracyPage() {
  return <CourseOverview locale="en" />;
}
