import type { Metadata } from "next";
import { InstitutionDashboard, type CatalogCourse } from "@/components/academy/Institution";
import { proCourses, tracks } from "@/data/academy";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Institution Dashboard · Investopia Academy",
  description: "For banks and MFIs with an Academy subscription: give staff access, assign courses and follow enrollment, performance and completion.",
  robots: { index: false },
};

// Only what the dashboard needs, so the course content stays out of the page.
const catalog: CatalogCourse[] = proCourses.map((c) => ({
  slug: c.slug,
  title: c.title,
  track: tracks.find((t) => t.id === c.track)?.name ?? c.track,
  modules: c.modules.map((m) => m.id),
  simulation: Boolean(c.simulation),
}));

export default function InstitutionPage() {
  return (
    <>
      <PageHero
        eyebrow="Investopia Academy for institutions"
        title="Institution dashboard"
        subhead="For the training department of a subscribing bank or MFI: give your staff access, assign their courses, and follow enrollment, performance and completion in one place."
      />
      <InstitutionDashboard catalog={catalog} />
    </>
  );
}
