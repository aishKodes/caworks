import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactSection } from "@/components/ContactSection";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PricingCards } from "@/components/PricingCards";
import { QuickLeadForm } from "@/components/QuickLeadForm";
import { SEOJsonLd } from "@/components/SEOJsonLd";
import { SectionHeader } from "@/components/SectionHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { TrustBadges } from "@/components/TrustBadges";
import { getRelatedServices, getServiceBySlug, services } from "@/data/services";
import { siteConfig } from "@/data/site.config";
import { getLocalPageContent, getPricingContent, getServiceContent, getServicePricingNote, serviceFromCmsContent, type LocalPageContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { getBreadcrumbSchema, getFAQSchema } from "@/lib/schema";

const staticPages = {
  pricing: {
    title: "Pricing",
    metaTitle: "Pricing for Tax, GST, Insurance Claim and Business Support",
    description: "Starting prices and custom fee guidance for ITR, GST, insurance claim, loan and business paperwork support."
  },
  contact: {
    title: "Contact",
    metaTitle: "Contact VB Consultants",
    description: "Contact support for ITR, GST, insurance claim, loan paperwork and business compliance requests."
  },
  about: {
    title: "About",
    metaTitle: "About VB Consultants",
    description: "Learn about this online tax, GST, insurance claim, loan and business paperwork support platform."
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

export const revalidate = 300;

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
  const remoteService = await getServiceContent(slug);
  if (remoteService) {
    const serviceFromCms = serviceFromCmsContent(remoteService);
    return buildMetadata({
      title: serviceFromCms.metaTitle,
      description: serviceFromCms.metaDescription,
      path: `/${slug}`
    });
  }
  const localPage = await getLocalPageContent(slug);
  if (localPage) {
    return buildMetadata({
      title: localPage.metaTitle || localPage.title,
      description: localPage.metaDescription || "Simple local tax, GST and business paperwork support.",
      path: `/${slug}`,
      image: localPage.imagePath || siteConfig.images.ogDefault
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
    const [override, pricingNote] = await Promise.all([getServiceContent(slug), getServicePricingNote(slug)]);
    return (
      <ServicePageTemplate
        heroImage={override?.heroImage}
        service={{
          ...service,
          heroTitle: override?.title || service.heroTitle,
          heroText: override?.subtitle || service.heroText,
          whoFor: override?.sections?.whoFor || override?.sections?.who || service.whoFor,
          whatWeDo: override?.sections?.whatWeDo || service.whatWeDo,
          documents: override?.sections?.documents || service.documents,
          process: override?.sections?.process || service.process,
          priceNote: pricingNote || override?.pricingText || service.priceNote,
          faqs: override?.faqs?.length ? override.faqs : service.faqs,
          metaTitle: override?.seoTitle || service.metaTitle,
          metaDescription: override?.seoDescription || service.metaDescription
        }}
      />
    );
  }

  const remoteService = await getServiceContent(slug);
  if (remoteService) {
    const pricingNote = await getServicePricingNote(slug);
    const cmsService = serviceFromCmsContent(remoteService);
    return <ServicePageTemplate heroImage={remoteService.heroImage} service={{ ...cmsService, priceNote: pricingNote || cmsService.priceNote }} />;
  }

  if (slug === "pricing") return <PricingPage />;
  if (slug === "contact") return <ContactPage />;
  if (slug === "about") return <AboutPage />;
  if (slug === "privacy-policy" || slug === "terms-and-conditions" || slug === "refund-policy") {
    return <LegalPage slug={slug} />;
  }

  const localPage = await getLocalPageContent(slug);
  if (localPage) return <LocalCmsPage page={localPage} />;

  notFound();
}

async function PricingPage() {
  const pricingContent = await getPricingContent();
  return (
    <>
      <SEOJsonLd data={getBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }])} />
      <Breadcrumbs items={[{ name: "Pricing", href: "/pricing" }]} />
      <section className="container-shell pb-16 pt-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Pricing</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">Starting prices with clear confirmation.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-charcoal-700">Final fee depends on documents, income type and complexity. We confirm the fee before starting work.</p>
        <div className="mt-9"><PricingCards plans={pricingContent} /></div>
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
      <section className="container-shell pb-16 pt-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Contact</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">Contact VB Consultants</h1>
          <p className="mt-5 text-lg leading-8 text-charcoal-700">Enter your phone number or send a WhatsApp message. We will guide you with simple next steps.</p>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          <ContactSection />
          <QuickLeadForm sourcePage="contact" />
        </div>
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
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">A practical help desk for tax, claims and business paperwork.</h1>
          <p className="mt-5 text-lg leading-8 text-muted">The platform helps Indian families, salaried people and small businesses move ITR, GST, insurance claim, loan and compliance requests forward from a phone.</p>
          <div className="mt-8"><TrustBadges /></div>
        </div>
        <Image src={siteConfig.images.gstConsultation} alt="VB Consultants business support consultation" width={900} height={700} className="aspect-[4/3] h-auto w-full rounded-3xl object-cover object-center shadow-premium" />
      </section>
      <CTASection className="pb-16" />
    </>
  );
}

function LocalCmsPage({ page }: { page: LocalPageContent }) {
  const related = getRelatedServices(page.relatedServices || []);
  const faqs = page.faqs || [];
  return (
    <>
      <SEOJsonLd
        data={[
          ...(faqs.length ? [getFAQSchema(faqs)] : []),
          getBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: page.title, path: `/${page.slug}` }
          ])
        ]}
      />
      <Breadcrumbs items={[{ name: page.title, href: `/${page.slug}` }]} />
      <section className="container-shell grid gap-10 pb-16 pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">{page.city || "Local"} support</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">{page.heroTitle || page.title}</h1>
          <div
            className="prose prose-charcoal mt-6 max-w-none text-base leading-8 text-charcoal-700"
            dangerouslySetInnerHTML={{ __html: page.bodyContent || "<p>Start with your phone number and our team will guide the next step.</p>" }}
          />
        </div>
        <Image
          src={page.imagePath || siteConfig.images.gstConsultation}
          alt={`${page.title} support`}
          width={900}
          height={700}
          className="aspect-[4/3] h-auto w-full rounded-3xl object-cover object-center shadow-premium"
        />
      </section>
      {faqs.length ? (
        <section className="container-shell pb-16">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeader eyebrow="FAQ" title="Simple local answers" />
            <FAQAccordion faqs={faqs} />
          </div>
        </section>
      ) : null}
      {related.length ? (
        <section className="bg-white/70 py-16">
          <div className="container-shell">
            <SectionHeader eyebrow="Related services" title="Common next steps" />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {related.slice(0, 3).map((item) => <ServiceCard key={item.slug} service={item} />)}
            </div>
          </div>
        </section>
      ) : null}
      <CTASection className="pb-16" />
    </>
  );
}

const legalText = {
  "privacy-policy": [
    ["Information collected", "We collect details submitted through forms, signup, login, document upload, payment flows and contact messages, including name, phone, email, service need and message."],
    ["Document handling", "Documents are used only for the selected request. Upload only files needed for your work."],
    ["Analytics and ads", "We may use cookies, UTM details, click IDs and analytics or advertising tools to understand lead source, improve service pages and measure ads."],
    ["Follow-up", "We may contact you by phone, WhatsApp or email about your request. We do not sell personal data."],
    ["Sharing", "Information may be shared with service providers, payment processors, professional partners and government or insurance portals only when required for the request."],
    ["Correction or deletion", "You can contact us to request correction or deletion of personal details where legally and operationally possible."],
    ["Security", "We use access controls, private uploads and secure handling practices. No online system is risk free."]
  ],
  "terms-and-conditions": [
    ["Service scope", "Submitting a request does not guarantee any outcome. Paid work starts only after scope and fee are confirmed."],
    ["User responsibility", "You must provide accurate information and documents. Wrong or incomplete records can affect timelines and outcomes."],
    ["Communication", "By submitting a request, you agree that we may contact you by phone, WhatsApp or email for follow-up and document clarification."],
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
          <p className="mt-5 text-sm leading-7 text-muted">
            VB Consultants is the public brand of {siteConfig.registeredBusinessName}. This is starter legal text. Review with a lawyer before launch.
          </p>
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
