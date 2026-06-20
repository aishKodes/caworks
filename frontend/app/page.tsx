import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { HeroSection } from "@/components/HeroSection";
import { PricingCards } from "@/components/PricingCards";
import { ProcessSteps } from "@/components/ProcessSteps";
import { SectionHeader } from "@/components/SectionHeader";
import { SEOJsonLd } from "@/components/SEOJsonLd";
import { TestimonialCards } from "@/components/TestimonialCards";
import { TrustBadges } from "@/components/TrustBadges";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { homeFaqs } from "@/data/faqs";
import { siteConfig, whatsappMessages } from "@/data/site.config";
import { getHomepageContent, getPricingContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { getBreadcrumbSchema, getFAQSchema } from "@/lib/schema";

const popularVisualServices = [
  {
    title: "Salary ITR Filing",
    text: "Upload Form 16 and basic documents from your phone.",
    href: "/salary-itr-filing",
    cta: "Start salary ITR",
    image: siteConfig.images.salaryItr
  },
  {
    title: "GST & Compliance",
    text: "Get help with GST filing, registration and business records.",
    href: "/gst-services",
    cta: "Get GST help",
    image: siteConfig.images.gstConsultation
  },
  {
    title: "Upload Documents",
    text: "Take a photo or upload PDF files securely.",
    href: "/upload-documents",
    cta: "Upload docs",
    image: siteConfig.images.mobileUpload
  },
  {
    title: "Payment & Tracking",
    text: "Pay online or upload a screenshot, then track status.",
    href: "/track-status",
    cta: "Track status",
    image: siteConfig.images.paymentTracking
  },
  {
    title: "Tax Notice Help",
    text: "Upload your notice and related records for next steps.",
    href: "/tax-notice-help",
    cta: "Get notice help",
    image: siteConfig.images.taxNotice
  },
  {
    title: "Loan & Project Report",
    text: "Business loan, project report and subsidy paperwork support.",
    href: "/loan-project-report",
    cta: "View loan help",
    image: siteConfig.images.loanProject
  }
];

const salaryBullets = [
  "Good for salaried people and pensioners",
  "Upload Form 16 and basic documents",
  "Check eligible deductions",
  "Pay only after fee is shown",
  "Track status online"
];

const individualItems = ["Salary ITR", "Form 16 filing", "Tax refund support", "Notice help", "Capital gains filing"];
const businessItems = ["GST filing", "Bookkeeping", "TDS", "Registration", "Payroll", "Project report", "Subsidy guidance"];
const individualLinks: Record<string, string> = {
  "Salary ITR": "/salary-itr-filing",
  "Form 16 filing": "/salary-itr-filing",
  "Tax refund support": "/salary-itr-filing",
  "Notice help": "/tax-notice-help",
  "Capital gains filing": "/itr-2-capital-gains-filing"
};
const businessLinks: Record<string, string> = {
  "GST filing": "/gst-services",
  Bookkeeping: "/bookkeeping",
  TDS: "/tds-return-filing",
  Registration: "/business-registration",
  Payroll: "/payroll-compliance",
  "Project report": "/loan-project-report",
  "Subsidy guidance": "/subsidy-scheme-guidance"
};

export const metadata: Metadata = buildMetadata({
  title: siteConfig.defaultTitle,
  description: siteConfig.description,
  path: "/"
});

export default async function HomePage() {
  const [homepageContent, pricingContent] = await Promise.all([getHomepageContent(), getPricingContent()]);
  const faqContent = homepageContent.faqs.length ? homepageContent.faqs : homeFaqs;

  return (
    <>
      <SEOJsonLd data={[getFAQSchema(faqContent), getBreadcrumbSchema([{ name: "Home", path: "/" }])]} />
      <HeroSection
        title={homepageContent.heroTitle}
        subtitle={homepageContent.heroSubtitle}
        image={homepageContent.heroImage}
        primaryCtaLabel={homepageContent.primaryCtaLabel}
        primaryCtaHref={homepageContent.primaryCtaHref}
        secondaryCtaLabel={homepageContent.secondaryCtaLabel}
        secondaryCtaHref={homepageContent.secondaryCtaHref}
      />

      <section className="container-shell pb-10 pt-2">
        <TrustBadges />
      </section>

      <section className="container-shell section-padding pt-8">
        <SectionHeader
          eyebrow="Popular services"
          title="Choose what you need today"
          description="Simple online support for tax, GST, notices, loans and business paperwork."
        />
        <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {popularVisualServices.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group overflow-hidden rounded-3xl border border-charcoal-900/10 bg-white shadow-soft transition duration-200 hover:-translate-y-1 hover:border-brand-600/30 hover:shadow-premium"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-paper">
                <Image
                  src={service.image}
                  alt={`${service.title} support`}
                  fill
                  sizes="(min-width: 1024px) 31vw, (min-width: 768px) 47vw, 100vw"
                  className="object-cover object-center transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5 md:p-6">
                <h2 className="text-xl font-semibold tracking-tight text-charcoal-900">{service.title}</h2>
                <p className="mt-3 text-base leading-7 text-muted">{service.text}</p>
                <span className="mt-5 inline-flex text-sm font-semibold text-brand-700 transition group-hover:translate-x-1">{service.cta}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white/75 py-16 md:py-20">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="overflow-hidden rounded-[2rem] border border-charcoal-900/10 bg-white p-2 shadow-premium lg:order-2">
            <Image
              src={siteConfig.images.salaryItr}
              alt="Family preparing salary ITR with Form 16"
              width={1200}
              height={900}
              className="aspect-[4/3] h-auto w-full rounded-[1.45rem] object-cover object-center"
            />
          </div>
          <div>
            <SectionHeader
              eyebrow="Salary ITR launch"
              title="Salary ITR filing from ₹199 onwards"
              description="Have Form 16? Upload it from your phone. We will check your details and guide you with the next step."
            />
            <div className="mt-7 grid gap-3">
              {salaryBullets.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-charcoal-900/10 bg-white p-4 text-base font-semibold leading-7 text-charcoal-900 shadow-soft">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">✓</span>
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/start" className="inline-flex justify-center rounded-full bg-brand-600 px-7 py-4 text-base font-semibold text-white shadow-red transition hover:bg-brand-700">
                Start Salary ITR
              </Link>
              <WhatsAppButton message={whatsappMessages.salaryItr} />
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell section-padding">
        <SectionHeader
          eyebrow="How it works"
          title="Four simple steps from your phone"
          description="Large steps, clear status and no unnecessary confusion."
        />
        <div className="mt-9">
          <ProcessSteps />
        </div>
      </section>

      <section className="bg-white/75 py-16 md:py-20">
        <div className="container-shell grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem] border border-charcoal-900/10 bg-white shadow-premium">
            <Image src={siteConfig.images.mobileUpload} alt="Uploading documents from phone" width={1200} height={900} className="aspect-[4/3] h-auto w-full object-cover object-center" />
            <div className="p-6 md:p-8">
              <SectionHeader
                eyebrow="Upload documents"
                title="Upload documents from your phone"
                description="Take a photo or upload PDF files. You can also send documents on WhatsApp if you need help."
              />
              <Link href="/upload-documents" className="mt-7 inline-flex rounded-full bg-brand-600 px-7 py-4 text-base font-semibold text-white shadow-red transition hover:bg-brand-700">
                Upload Documents
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-charcoal-900/10 bg-white shadow-premium">
            <Image src={siteConfig.images.paymentTracking} alt="Payment and request status tracking" width={1200} height={900} className="aspect-[4/3] h-auto w-full object-cover object-center" />
            <div className="p-6 md:p-8">
              <SectionHeader
                eyebrow="Payment and tracking"
                title="Simple payment and status tracking"
                description="Pay online through Razorpay or upload a manual payment screenshot. You can see your request status anytime."
              />
              <Link href="/track-status" className="mt-7 inline-flex rounded-full border border-charcoal-900/10 bg-white px-7 py-4 text-base font-semibold text-charcoal-900 shadow-soft transition hover:border-brand-600 hover:text-brand-700">
                Track My Request
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell section-padding">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow={`Why choose ${siteConfig.name}`}
              title="Built for people who want less confusion"
              description="VB Consultants is built for people who want tax and business paperwork handled without confusion. You can start with just your phone number. Our team will guide you step by step."
            />
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {["Simple mobile process", "Secure document upload", "Clear fee before work", "WhatsApp support", "Status tracking", "No false refund promises"].map((item) => (
                <div key={item} className="rounded-2xl border border-charcoal-900/10 bg-white p-4 text-base font-semibold leading-7 text-charcoal-900 shadow-soft">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-charcoal-900/10 bg-white p-2 shadow-premium">
            <Image src={siteConfig.images.gstConsultation} alt="Business paperwork support consultation" width={1200} height={900} className="aspect-[4/3] h-auto w-full rounded-[1.45rem] object-cover object-center" />
          </div>
        </div>
      </section>

      <section className="bg-white/75 py-16 md:py-20">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Pricing"
            title="Clear starting prices"
            description="Final fee depends on documents, income type and complexity. We confirm the fee before starting work."
          />
          <div className="mt-9">
            <PricingCards plans={pricingContent} />
          </div>
        </div>
      </section>

      <section className="container-shell section-padding">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-charcoal-900/10 bg-white p-6 shadow-soft md:p-8">
            <SectionHeader eyebrow="For individuals" title="For salaried people and families" description="Simple support for common tax and notice work." />
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {individualItems.map((item) => (
                <Link key={item} href={individualLinks[item]} className="rounded-2xl bg-paper p-4 text-base font-semibold text-charcoal-900 transition hover:bg-brand-50">
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-charcoal-900/10 bg-charcoal-900 p-6 text-white shadow-premium md:p-8">
            <SectionHeader eyebrow="For businesses" title="For small businesses" description="GST, bookkeeping, filings, payroll, registrations and loan paperwork." className="text-white [&_h2]:text-white [&_p]:text-white/70" />
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {businessItems.map((item) => (
                <Link key={item} href={businessLinks[item]} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-base font-semibold text-white transition hover:bg-white/15">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/75 py-16 md:py-20">
        <div className="container-shell">
          <SectionHeader eyebrow="User notes" title="Placeholder testimonials" description="Replace these with approved real feedback later." />
          <div className="mt-9">
            <TestimonialCards />
          </div>
        </div>
      </section>

      <section className="container-shell section-padding">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader eyebrow="FAQ" title="Simple answers before you start" />
          <FAQAccordion faqs={faqContent} />
        </div>
      </section>

      <CTASection title={homepageContent.finalCtaTitle} description={homepageContent.finalCtaDescription} className="section-padding pt-0" />
    </>
  );
}
