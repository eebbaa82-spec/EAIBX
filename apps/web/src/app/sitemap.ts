import type { MetadataRoute } from "next";
import { publicRoutes, siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return publicRoutes().map((route) => ({
    url: `${siteUrl}${route === "/" ? "/" : `${route}/`}`,
    lastModified,
    changeFrequency: route === "/" || route.startsWith("/knowledge") ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.split("/").length === 2 ? 0.8 : 0.6,
  }));
}
