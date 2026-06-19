import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactSection } from "@/components/ContactSection";
import { CTASection } from "@/components/CTASection";
import { PricingCards } from "@/components/PricingCards";
import { QuickLeadForm } from "@/components/QuickLeadForm";
import { SEOJsonLd } from "@/components/SEOJsonLd";
import { SectionHeader } from "@/components/SectionHeader";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { TrustBadges } from "@/components/TrustBadges";
import { getServiceBySlug, services } from "@/data/services";
import { siteConfig } from "@/data/site.config";
import { getPricingContent, getServiceContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { getBreadcrumbSchema } from "@/lib/schema";

const staticPages = {
  pricing: {
    title: "Pricing",
    metaTitle: "Pricing for Tax, GST and Business Paperwork Help",
    description: "Starting prices for salary ITR, ITR-1, GST filing, tax notice help, loan project report and business paperwork support."
  },
  contact: {
    title: "Contact",
    metaTitle: "Contact Vedanath Business Consultants",
    description: "Contact support for ITR filing, GST, tax notice, loan paperwork and business compliance requests."
  },
  about: {
    title: "About",
    metaTitle: "About Vedanath Business Consultants",
    description: "Learn about this online tax, GST, loan and business paperwork help platform."
  },
  "privacy-policy": {
    title: "Privacy Policy",
    metaTitle: "Privacy Policy",
    description: "How personal details and documents are handled for online tax and paperwork requests."
  },
  "terms-and-conditions": {
    title: "Terms and Conditions",
    metaTitle: "Terms and Conditions",
    description: "Terms for using the online tax and paperwork help platform."
  },
  "refund-policy": {
    title: "Refund Policy",
    metaTitle: "Refund Policy",
    description: "Refund and payment policy for tax, GST and paperwork services."
  }
} as const;

type StaticSlug = keyof typeof staticPages;
type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [
    ...services.map((service) => ({ slug: service.slug })),
    ...Object.keys(staticPages).map((slug) => ({ slug }))
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (service) {
    const override = await getServiceContent(slug);
    return buildMetadata({
      title: override?.seoTitle || service.metaTitle,
      description: override?.seoDescription || service.metaDescription,
      path: `/${slug}`
    });
  }
  const page = staticPages[slug as StaticSlug];
  if (!page) return {};
  return buildMetadata({ title: page.metaTitle, description: page.description, path: `/${slug}` });
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (service) {
    const override = await getServiceContent(slug);
    return (
      <ServicePageTemplate
        heroImage={override?.heroImage}
        service={{
          ...service,
          heroTitle: override?.title || service.heroTitle,
          heroText: override?.subtitle || service.heroText,
          priceNote: override?.pricingText || service.priceNote,
          faqs: override?.faqs?.length ? override.faqs : service.faqs,
          metaTitle: override?.seoTitle || service.metaTitle,
          metaDescription: override?.seoDescription || service.metaDescription
        }}
      />
    );
  }

  if (slug === "pricing") return <PricingPage />;
  if (slug === "contact") return <ContactPage />;
  if (slug === "about") return <AboutPage />;
  if (slug === "privacy-policy" || slug === "terms-and-conditions" || slug === "refund-policy") {
    return <LegalPage slug={slug} />;
  }

  notFound();
}

async function PricingPage() {
  const pricingContent = await getPricingContent();
  return (
    <>
      <SEOJsonLd data={getBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }])} />
      <Breadcrumbs items={[{ name: "Pricing", href: "/pricing" }]} />
      <section className="container-shell pb-16 pt-8">
        <SectionHeader eyebrow="Pricing" title="Starting prices with clear confirmation." description="Final fee depends on documents, income sources and complexity. We will confirm before work starts." />
        <div className="mt-9"><PricingCards plans={pricingContent} /></div>
        <div className="mt-10 rounded-2xl bg-brand-50 p-5 text-sm leading-7 text-brand-900">
          We do not make false refund promises. Tax, refund or payable amount depends on official records and eligibility.
        </div>
      </section>
      <CTASection className="pb-16" />
    </>
  );
}

function ContactPage() {
  return (
    <>
      <SEOJsonLd data={getBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <Breadcrumbs items={[{ name: "Contact", href: "/contact" }]} />
      <section className="container-shell grid gap-10 pb-16 pt-8 lg:grid-cols-[1fr_420px]">
        <ContactSection />
        <QuickLeadForm sourcePage="contact" />
      </section>
    </>
  );
}

function AboutPage() {
  return (
    <>
      <SEOJsonLd data={getBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
      <Breadcrumbs items={[{ name: "About", href: "/about" }]} />
      <section className="container-shell grid gap-10 pb-16 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">About</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">A mobile help desk for tax and business paperwork.</h1>
          <p className="mt-5 text-lg leading-8 text-muted">The platform helps Indian salaried people, families, freelancers and small businesses upload documents, pay securely and track paperwork requests from a phone.</p>
          <div className="mt-8"><TrustBadges /></div>
        </div>
        <Image src={siteConfig.images.contact} alt="Vedanath Business Consultants office placeholder" width={900} height={700} className="rounded-3xl object-cover shadow-premium" />
      </section>
      <CTASection className="pb-16" />
    </>
  );
}

const legalText = {
  "privacy-policy": [
    ["Information collected", "We collect details submitted through forms, signup, login, document upload, payment flows and contact messages."],
    ["Document handling", "Documents are used only for the selected request. Upload only files needed for your work."],
    ["Sharing", "Information may be shared with service providers, payment processors and government portals only when required for the request."],
    ["Security", "We use access controls, private uploads and secure handling practices. No online system is risk free."]
  ],
  "terms-and-conditions": [
    ["Service scope", "Submitting a request does not start paid work until scope and fee are confirmed."],
    ["User responsibility", "You must provide accurate information and documents."],
    ["No misleading promises", "We do not promise refund, tax saving or outcomes controlled by official systems."],
    ["Timelines", "Timelines depend on documents, payment, user response and portal availability."]
  ],
  "refund-policy": [
    ["Before work starts", "If work has not started, fee adjustment or refund review may be possible."],
    ["After work starts", "Once review, preparation, filing support or paperwork has started, service fee may not be refundable."],
    ["Government and third-party charges", "Government fees, penalties, payment gateway charges and third-party costs are not refundable by us."],
    ["Manual payments", "Manual payment screenshots are verified by the admin before status is updated."]
  ]
} as const;

function LegalPage({ slug }: { slug: keyof typeof legalText }) {
  const page = staticPages[slug];
  return (
    <>
      <SEOJsonLd data={getBreadcrumbSchema([{ name: "Home", path: "/" }, { name: page.title, path: `/${slug}` }])} />
      <Breadcrumbs items={[{ name: page.title, href: `/${slug}` }]} />
      <section className="container-shell pb-16 pt-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Legal</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">{page.title}</h1>
          <p className="mt-5 text-sm leading-7 text-muted">This is starter legal text. Review with a lawyer before launch.</p>
          <div className="mt-10 space-y-5">
            {legalText[slug].map(([heading, body]) => (
              <section key={heading} className="rounded-3xl border border-charcoal-900/10 bg-white p-6 shadow-soft">
                <h2 className="text-xl font-semibold text-charcoal-900">{heading}</h2>
                <p className="mt-3 text-sm leading-7 text-charcoal-700">{body}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
