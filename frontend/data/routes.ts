import { blogPosts } from "@/data/blogPosts";
import { services } from "@/data/services";

export const staticRoutes = [
  "/",
  "/start",
  "/quick-contact",
  "/login",
  "/signup",
  "/dashboard",
  "/dashboard/requests",
  "/dashboard/upload",
  "/upload-documents",
  "/track-status",
  "/pricing",
  "/contact",
  "/about",
  "/privacy-policy",
  "/terms-and-conditions",
  "/refund-policy",
  "/blog"
] as const;

export const allPublicRoutes = [
  ...staticRoutes,
  ...services.map((service) => `/${service.slug}`),
  ...blogPosts.map((post) => `/blog/${post.slug}`)
] as const;
