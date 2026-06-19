import type { MetadataRoute } from "next";
import { allPublicRoutes } from "@/data/routes";
import { siteConfig } from "@/data/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return allPublicRoutes.map((route) => ({
    url: `${siteConfig.siteUrl}${route === "/" ? "" : route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.includes("salary-itr") || route.includes("itr-1") ? 0.9 : 0.7
  }));
}
