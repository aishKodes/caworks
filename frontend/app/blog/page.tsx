import type { Metadata } from "next";
import { BlogCard } from "@/components/BlogCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { SEOJsonLd } from "@/components/SEOJsonLd";
import { getBlogContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { getBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Guides",
  description: "Simple guides for ITR, GST, insurance claims, business paperwork, loans and subsidy documents.",
  path: "/blog"
});

export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getBlogContent();
  return (
    <>
      <SEOJsonLd data={getBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guides", path: "/blog" }])} />
      <Breadcrumbs items={[{ name: "Guides", href: "/blog" }]} />
      <section className="container-shell pb-16 pt-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Guides</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">Simple tax, claim and paperwork guides.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">Read simple guides, then start a request if you need help.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => <BlogCard key={post.slug} post={post} />)}
        </div>
      </section>
      <CTASection className="pb-16" />
    </>
  );
}
