import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { SEOJsonLd } from "@/components/SEOJsonLd";
import { SectionHeader } from "@/components/SectionHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { getRelatedServices } from "@/data/services";
import { getBlogContent, getBlogPostContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { getArticleSchema, getBreadcrumbSchema } from "@/lib/schema";

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getBlogContent();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostContent(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.metaTitle,
    description: post.metaDescription,
    path: `/blog/${post.slug}`,
    image: post.image,
    type: "article",
    publishedTime: post.publishedAt
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostContent(slug);
  if (!post) notFound();
  const related = getRelatedServices(post.relatedServices);

  return (
    <>
      <SEOJsonLd
        data={[
          getArticleSchema(post),
          getBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` }
          ])
        ]}
      />
      <Breadcrumbs items={[{ name: "Guides", href: "/blog" }, { name: post.title, href: `/blog/${post.slug}` }]} />
      <article className="container-shell pb-16 pt-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">{post.category}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">{post.title}</h1>
          <p className="mt-5 text-lg leading-8 text-muted">{post.excerpt}</p>
          <div className="relative mt-8 aspect-video overflow-hidden rounded-3xl border border-charcoal-900/10 bg-white shadow-premium">
            <Image src={post.image} alt="" fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover object-center" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/40 to-transparent" />
          </div>
          <div className="mt-6 rounded-3xl bg-brand-50 p-5">
            <p className="text-sm font-semibold text-brand-900">Need help with this? Start a request and upload documents from your phone.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link href="/start" className="rounded-full bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white">Start request</Link>
              <Link href="/quick-contact" className="rounded-full border border-brand-600 px-5 py-3 text-center text-sm font-semibold text-brand-700">Enter phone number</Link>
            </div>
          </div>
        </div>

        {"contentHtml" in post && post.contentHtml ? (
          <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-charcoal-900/10 bg-white p-6 text-base leading-8 text-charcoal-700 shadow-soft" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        ) : (
          <div className="mx-auto mt-10 max-w-3xl space-y-7">
            {post.sections.map((section) => (
              <section key={section.heading} className="rounded-3xl border border-charcoal-900/10 bg-white p-6 shadow-soft">
                <h2 className="text-2xl font-semibold tracking-tight text-charcoal-900">{section.heading}</h2>
                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-8 text-charcoal-700">{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-charcoal-900/10 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-charcoal-900">Guide details</h2>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted">
            <span>Updated: {new Date(`${post.updatedAt}T00:00:00`).toLocaleDateString("en-IN")}</span>
            <span>·</span>
            <span>{post.readingTime}</span>
            <span>·</span>
            <span>{post.tags.join(", ")}</span>
          </div>
        </div>

        {related.length ? (
          <section className="mt-16">
            <SectionHeader eyebrow="Related services" title="Next step" description="Choose a service if this guide matches your situation." />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {related.slice(0, 3).map((service) => <ServiceCard key={service.slug} service={service} />)}
            </div>
          </section>
        ) : null}
      </article>
      <CTASection className="pb-16" />
    </>
  );
}
