import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BlogCard } from "@/components/BlogCard";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { HeroSection } from "@/components/HeroSection";
import { PricingCards } from "@/components/PricingCards";
import { ProcessSteps } from "@/components/ProcessSteps";
import { SectionHeader } from "@/components/SectionHeader";
import { ServiceGrid } from "@/components/ServiceGrid";
import { TestimonialCards } from "@/components/TestimonialCards";
import { TrustBadges } from "@/components/TrustBadges";
import { blogPosts } from "@/data/blogPosts";
import { homeFaqs } from "@/data/faqs";
import { siteConfig } from "@/data/site.config";
import { getHomepageContent, getPricingContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

const workflowCards = [
  {
    title: "Upload documents",
    text: "Upload PDF or image files from your phone. Missing files can be added later.",
    href: "/upload-documents",
    image: siteConfig.images.uploadWorkflow
  },
  {
    title: "Payment options",
    text: "Use Razorpay online payment or upload a manual payment screenshot.",
    href: "/pricing",
    image: siteConfig.images.payment
  },
  {
    title: "Track status",
    text: "See document, payment and work status from your dashboard.",
    href: "/track-status",
    image: siteConfig.images.heroDashboard
  }
];

const whyItems = [
  "Simple mobile-first request flow",
  "Clear fee before work starts",
  "Private document handling",
  "WhatsApp fallback on every journey",
  "Razorpay and manual payment options",
  "No false refund promises"
];

export const metadata: Metadata = buildMetadata({
  title: siteConfig.defaultTitle,
  description: siteConfig.description,
  path: "/"
});

export default async function HomePage() {
  const [homepageContent, pricingContent] = await Promise.all([getHomepageContent(), getPricingContent()]);

  return (
    <>
      <HeroSection
        title={homepageContent.heroTitle}
        subtitle={homepageContent.heroSubtitle}
        image={homepageContent.heroImage}
        primaryCtaLabel={homepageContent.primaryCtaLabel}
        primaryCtaHref={homepageContent.primaryCtaHref}
        secondaryCtaLabel={homepageContent.secondaryCtaLabel}
        secondaryCtaHref={homepageContent.secondaryCtaHref}
      />

      <section className="container-shell -mt-4 pb-10">
        <TrustBadges />
      </section>

      <section className="container-shell section-padding pt-8">
        <SectionHeader
          eyebrow="Popular services"
          title="Start with the service you need."
          description="If you are not sure, choose Not Sure. We will check and guide you."
        />
        <div className="mt-9">
          <ServiceGrid />
        </div>
      </section>

      <section className="bg-white/70 py-16">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="Launch focus"
              title="Salary ITR and ITR-1 filing starts from ₹199."
              description="Upload Form 16, PAN, Aadhaar, AIS or Form 26AS if available, bank details and proofs. Pay only after you see the fee."
            />
            <div className="mt-6 inline-flex rounded-full border border-brand-600/20 bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700">
              Final fee depends on documents, income type and complexity.
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/start" className="rounded-full bg-brand-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-red">Start ITR Filing</Link>
              <Link href="/salary-itr-filing" className="rounded-full border border-charcoal-900/10 px-6 py-3 text-center text-sm font-semibold text-charcoal-900">Learn more</Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-charcoal-900/10 bg-white shadow-premium">
            <Image src={siteConfig.images.individualItr} alt="Individual filing ITR from phone" width={1200} height={900} className="h-full min-h-[320px] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="container-shell section-padding">
        <SectionHeader eyebrow="How it works" title="A mobile help desk for tax and paperwork." description="Short steps. Clear status. No unnecessary verification." />
        <div className="mt-9">
          <ProcessSteps />
        </div>
      </section>

      <section className="bg-charcoal-900 py-16 text-white">
        <div className="container-shell">
          <SectionHeader eyebrow="Upload, pay, track" title="A complete request desk in your pocket." description="The main steps are visible, simple and designed for mobile users." className="text-white [&_h2]:text-white [&_p]:text-white/70" />
          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            {workflowCards.map((card) => (
            <Link key={card.title} href={card.href} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/8 transition hover:-translate-y-1 hover:bg-white/12">
              <div className="relative h-44">
                <Image src={card.image} alt="" fill sizes="(min-width: 1024px) 32vw, 100vw" className="object-cover opacity-86 transition duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 to-transparent" />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-semibold tracking-tight">{card.title}</h2>
                <p className="mt-3 text-sm leading-7 text-white/70">{card.text}</p>
                <span className="mt-5 inline-flex text-sm font-semibold text-white">Open</span>
              </div>
            </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell section-padding">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="overflow-hidden rounded-3xl border border-charcoal-900/10 bg-white shadow-premium">
            <Image src={siteConfig.images.compliance} alt="Business consulting and compliance support" width={1200} height={900} className="h-full min-h-[360px] w-full object-cover" />
          </div>
          <div>
            <SectionHeader
              eyebrow="Why choose Vedanath Business Consultants"
              title="Serious paperwork support, kept simple for real users."
              description="The platform is built for people who want clear next steps, private uploads, transparent fees and status updates without confusing language."
            />
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {whyItems.map((item) => (
                <div key={item} className="rounded-2xl border border-charcoal-900/10 bg-white p-4 text-sm font-semibold leading-6 text-charcoal-900 shadow-soft">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/70 py-16">
        <div className="container-shell">
          <SectionHeader eyebrow="Pricing" title="Clear starting prices." description="Final fee depends on documents, income type and complexity." />
          <div className="mt-9">
            <PricingCards plans={pricingContent} />
          </div>
        </div>
      </section>

      <section className="container-shell section-padding">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="For individuals" title="For salaried people and families." description="Salary ITR, ITR-1, capital gains, tax notices and general tax support." />
            <div className="mt-6 grid gap-3">
              {["Upload Form 16", "Check eligible deductions", "Track filing status", "Use WhatsApp when needed"].map((item) => (
                <div key={item} className="rounded-2xl bg-white p-4 text-sm font-semibold text-charcoal-900 shadow-soft">{item}</div>
              ))}
            </div>
          </div>
          <div>
            <SectionHeader eyebrow="For small businesses" title="For GST, loans and compliance." description="GST returns, bookkeeping, TDS, payroll, registrations, project reports and business loan paperwork." />
            <div className="mt-6 grid gap-3">
              {["GST data support", "Monthly bookkeeping", "Loan project report", "Business compliance tracking"].map((item) => (
                <div key={item} className="rounded-2xl bg-white p-4 text-sm font-semibold text-charcoal-900 shadow-soft">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell section-padding">
        <SectionHeader eyebrow="Trust" title="Built for private documents and status tracking." description="Your details are kept private. Upload only what is needed." />
        <div className="mt-9">
          <TrustBadges />
        </div>
      </section>

      <section className="bg-white/70 py-16">
        <div className="container-shell">
          <SectionHeader eyebrow="User notes" title="Placeholder testimonials." description="Replace these with approved real feedback later." />
          <div className="mt-9">
            <TestimonialCards />
          </div>
        </div>
      </section>

      <section className="container-shell section-padding">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader eyebrow="FAQ" title="Simple answers before you start." />
          <FAQAccordion faqs={homepageContent.faqs.length ? homepageContent.faqs : homeFaqs} />
        </div>
      </section>

      <section className="bg-white/70 py-16">
        <div className="container-shell">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeader eyebrow="Guides" title="Helpful tax and business guides." />
            <Link href="/blog" className="text-sm font-semibold text-brand-700">View all guides</Link>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {blogPosts.slice(0, 3).map((post) => <BlogCard key={post.slug} post={post} />)}
          </div>
        </div>
      </section>

      <CTASection title={homepageContent.finalCtaTitle} description={homepageContent.finalCtaDescription} className="section-padding pt-16" />
    </>
  );
}
