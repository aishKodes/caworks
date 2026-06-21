import type { MetadataRoute } from "next";
import { allPublicRoutes } from "@/data/routes";
import { siteConfig } from "@/data/site.config";
import { getBlogContent, getServicesContent } from "@/lib/content";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [cmsServices, cmsPosts] = await Promise.all([getServicesContent(), getBlogContent()]);
  const cmsRoutes = [
    ...cmsServices.filter((service) => service.slug).map((service) => `/${service.slug}`),
    ...cmsPosts.filter((post) => post.slug).map((post) => `/blog/${post.slug}`)
  ];
  const routes = Array.from(new Set([...allPublicRoutes, ...cmsRoutes]));

  return routes.map((route) => ({
    url: `${siteConfig.siteUrl}${route === "/" ? "" : route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.includes("salary-itr") || route.includes("itr-1") ? 0.9 : 0.7
  }));
}
