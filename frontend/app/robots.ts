import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/dashboard/", "/login", "/signup", "/start", "/upload-documents", "/track-status", "/admin", "/admin/", "/api/"]
    },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`
  };
}
