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
import { TrustBadges } from "@/components/TrustBadges";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { homeFaqs } from "@/data/faqs";
import { siteConfig, whatsappMessages } from "@/data/site.config";
import { getHomepageContent, getPricingContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { getBreadcrumbSchema, getFAQSchema } from "@/lib/schema";

const servicePillars = [
  {
    icon: "tax",
    title: "Income Tax & ITR",
    text: "Salary ITR, Form 16, AIS, capital gains, business ITR and tax notice support.",
    href: "/salary-itr-filing",
    cta: "Get ITR help"
  },
  {
    icon: "business",
    title: "GST & Compliance",
    text: "GST return filing, registration, bookkeeping, TDS, payroll and business compliance support.",
    href: "/gst-services",
    cta: "View GST support"
  },
  {
    icon: "claim",
    title: "Insurance Claim Support",
    text: "Claim rejected, delayed, underpaid or stuck? We help with documentation, follow-up, rejection review, settlement papers and escalation support.",
    href: "/insurance-claim-support",
    cta: "Start Claim Support"
  },
  {
    icon: "loan",
    title: "Loan, Subsidy & Project Reports",
    text: "MSME/Udyam, project reports, business loan paperwork and subsidy documentation support.",
    href: "/loan-project-report",
    cta: "View loan support"
  }
];

const insuranceOfferings = [
  { title: "Insurance Claim Documentation Support", href: "/insurance-claim-documentation-support" },
  { title: "Health Insurance Claim Assistance", href: "/health-insurance-claim-help" },
  { title: "Life Insurance Claim Assistance", href: "/life-insurance-claim-assistance" },
  { title: "Motor Insurance Claim Support", href: "/motor-insurance-claim-support" },
  { title: "Personal Accident Insurance Claim Assistance", href: "/personal-accident-insurance-claim" },
  { title: "Claim Form Preparation & Submission Support", href: "/claim-form-preparation-support" },
  { title: "Claim Follow-up with Insurance Companies", href: "/insurance-claim-follow-up" },
  { title: "Claim Rejection Review & Documentation Guidance", href: "/insurance-claim-rejected" },
  { title: "Settlement Documentation Assistance", href: "/settlement-documentation-assistance" },
  { title: "Nominee Claim Assistance", href: "/nominee-claim-assistance" }
];

function PillarIcon({ type }: { type: string }) {
  const common = "h-7 w-7 fill-none stroke-current";
  if (type === "claim") return <svg aria-hidden="true" viewBox="0 0 24 24" className={common}><path d="M12 3 5 6v5c0 4.5 2.7 8.1 7 10 4.3-1.9 7-5.5 7-10V6l-7-3Z" strokeWidth="1.8"/><path d="m9 12 2 2 4-5" strokeWidth="1.8"/></svg>;
  if (type === "loan") return <svg aria-hidden="true" viewBox="0 0 24 24" className={common}><path d="M4 19h16M6 16V9m4 7V9m4 7V9m4 7V9M3 7l9-4 9 4H3Z" strokeWidth="1.8"/></svg>;
  if (type === "business") return <svg aria-hidden="true" viewBox="0 0 24 24" className={common}><path d="M4 21V7l8-4 8 4v14M8 10h2m4 0h2M8 14h2m4 0h2M10 21v-3h4v3" strokeWidth="1.8"/></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={common}><path d="M7 3h8l4 4v14H7V3Z" strokeWidth="1.8"/><path d="M15 3v5h4M10 12h6m-6 4h6" strokeWidth="1.8"/></svg>;
}

const salaryBullets = [
  "Good for salaried people and pensioners",
  "Upload Form 16 and basic documents",
  "Check eligible deductions",
  "Pay only after fee is shown",
  "Track status online"
];

const individualItems = ["Salary ITR", "Form 16 filing", "Insurance claim help", "Notice help", "Capital gains filing"];
const businessItems = ["GST filing", "Bookkeeping", "TDS", "Registration", "Payroll", "Project report", "Subsidy guidance"];
const adsTrustItems = [
  "Easy WhatsApp support",
  "Secure document upload",
  "Clear process",
  "Local Odisha support",
  "Insurance, tax, GST and business documentation help",
  "Call-back from team",
  "Google Business Profile available",
  "No false refund or claim approval promises"
];
const individualLinks: Record<string, string> = {
  "Salary ITR": "/salary-itr-filing",
  "Form 16 filing": "/salary-itr-filing",
  "Tax refund support": "/salary-itr-filing",
  "Insurance claim help": "/insurance-claim-support",
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

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: siteConfig.defaultTitle,
  description: siteConfig.description,
  path: "/"
});

export default async function HomePage() {
  const [homepageContent, pricingContent] = await Promise.all([getHomepageContent(), getPricingContent()]);
  const faqContent = homepageContent.faqs.length ? homepageContent.faqs : homeFaqs;
  const homepagePricingNames = new Set(["Salary ITR", "Salary ITR with review", "GST Filing", "Insurance Claim Documentation Support", "Loan Project Report", "Business Registration"]);
  const homepagePricing = pricingContent.filter((item) => homepagePricingNames.has(item.name)).slice(0, 6);
  const homepageInsuranceOfferings = insuranceOfferings.map((item, index) => ({
    ...item,
    title: homepageContent.insuranceProblems[index] || item.title
  }));

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

      <section id="services" className="container-shell scroll-mt-28 section-padding pt-8">
        <SectionHeader
          eyebrow="Four ways we help"
          title="Practical support for money and paperwork problems"
          description="Choose the area that matches your issue. If you are not sure, send your phone number and we will guide you."
        />
        <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {servicePillars.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group flex min-h-72 flex-col rounded-3xl border border-charcoal-900/10 bg-white p-6 shadow-soft transition duration-200 hover:-translate-y-1 hover:border-brand-600/30 hover:shadow-premium"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><PillarIcon type={service.icon} /></span>
              <h2 className="mt-6 text-xl font-semibold tracking-tight text-charcoal-900">{service.title}</h2>
              <p className="mt-3 text-base leading-7 text-charcoal-700">{service.text}</p>
              <span className="mt-auto pt-6 text-sm font-semibold text-brand-700 transition group-hover:translate-x-1">{service.cta}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-charcoal-900 py-16 text-white md:py-20">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-300">Insurance claim support</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">{homepageContent.insuranceTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-white/75">
              {homepageContent.insuranceSubtitle}
            </p>
            <p className="mt-6 text-lg font-semibold text-white">VB Consultants — Your trusted partner for insurance claim support.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/request-service?service=insurance-claim-support" className="inline-flex justify-center rounded-full bg-brand-600 px-7 py-4 text-base font-semibold text-white shadow-red transition hover:bg-brand-700">
                Get Insurance Claim Help
              </Link>
              <Link href="/request-service?service=insurance-claim-support&intent=upload_documents" className="inline-flex justify-center rounded-full border border-white/20 bg-white px-7 py-4 text-base font-semibold text-charcoal-900 transition hover:bg-paper">
                Upload Claim Documents
              </Link>
              <WhatsAppButton message={whatsappMessages.insurance} variant="solid">Talk on WhatsApp</WhatsAppButton>
            </div>
          </div>
          <div className="min-w-0">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-2 shadow-premium">
              <Image src={siteConfig.images.insuranceClaim} alt="Insurance claim papers being reviewed" width={1200} height={900} className="aspect-[4/3] h-auto w-full rounded-[1.45rem] object-cover object-center" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {homepageInsuranceOfferings.map((service) => (
                <Link key={service.href} href={service.href} className="group rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-red-200"><PillarIcon type="claim" /></span>
                  <span className="mt-3 block text-sm font-semibold leading-6 text-white">{service.title}</span>
                  <span className="mt-2 block text-xs font-semibold text-red-200">View support</span>
                </Link>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white/70">
              <a href={`tel:${siteConfig.phone.replace(/[^\d+]/g, "")}`}>{siteConfig.phone}</a>
              <span>www.vbcbharat.com</span>
              <span>{siteConfig.address}</span>
            </div>
          </div>
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
          title="One simple process for tax, business and claim problems"
          description="Tell us the issue first. Upload what you have and our team will guide the next action."
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
              description="VB Consultants helps people move tax, compliance, insurance claim and business paperwork forward without confusing steps. Start with your phone number and our team will guide you."
            />
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {["Simple mobile process", "Secure document upload", "Clear fee before work", "WhatsApp support", "Status tracking", "Claim escalation support"].map((item) => (
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
            <PricingCards plans={homepagePricing.length ? homepagePricing : pricingContent.slice(0, 6)} />
          </div>
        </div>
      </section>

      <section className="container-shell section-padding">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-charcoal-900/10 bg-white p-6 shadow-soft md:p-8">
            <SectionHeader eyebrow="For individuals" title="For salaried people and families" description="Tax filing, notices, capital gains and insurance claim support." />
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
          <SectionHeader eyebrow="Trust" title="Why People Contact VBC Bharat" description="The process is built for people who want clear help with urgent money and paperwork problems." />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {adsTrustItems.map((item) => (
              <div key={item} className="rounded-2xl border border-charcoal-900/10 bg-white p-5 text-base font-semibold leading-7 text-charcoal-900 shadow-soft">
                {item}
              </div>
            ))}
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
