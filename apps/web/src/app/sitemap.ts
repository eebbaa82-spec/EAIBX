import type { MetadataRoute } from "next";
import { courseModules, coursePath } from "@/data/financial-literacy";
import { publicRoutes, siteUrl } from "@/lib/seo";
import { isCoe } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  // Module pages come from generateStaticParams, which the folder walk cannot see.
  const modules = !isCoe ? [] : courseModules.flatMap((m) => [`${coursePath}/${m.slug}`, `/am${coursePath}/${m.slug}`]);
  return [...publicRoutes(), ...modules].map((route) => ({
    url: `${siteUrl}${route === "/" ? "/" : `${route}/`}`,
    lastModified,
    changeFrequency: route === "/" || route.startsWith("/knowledge") ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.split("/").length === 2 ? 0.8 : 0.6,
  }));
}
