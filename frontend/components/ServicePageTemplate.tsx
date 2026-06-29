import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { GuestRequestForm } from "@/components/GuestRequestForm";
import { PhoneLink } from "@/components/PhoneLink";
import { ProcessSteps } from "@/components/ProcessSteps";
import { SEOJsonLd } from "@/components/SEOJsonLd";
import { SectionHeader } from "@/components/SectionHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { TrackedLink } from "@/components/TrackedLink";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getRelatedServices, type Service } from "@/data/services";
import { siteConfig, whatsappMessages } from "@/data/site.config";
import { getBreadcrumbSchema, getFAQSchema, getServiceSchema } from "@/lib/schema";

const insuranceSupportServices = [
  { title: "Insurance Claim Documentation Support", text: "Organize policy, evidence and insurer records.", href: "/insurance-claim-documentation-support" },
  { title: "Health Insurance Claim Assistance", text: "Hospital, reimbursement and cashless claim papers.", href: "/health-insurance-claim-help" },
  { title: "Life Insurance Claim Assistance", text: "Policy, nominee and settlement document support.", href: "/life-insurance-claim-assistance" },
  { title: "Motor Insurance Claim Support", text: "Accident, repair, survey and follow-up support.", href: "/motor-insurance-claim-support" },
  { title: "Personal Accident Claim Assistance", text: "Injury, disability and nominee claim documents.", href: "/personal-accident-insurance-claim" },
  { title: "Claim Form Preparation & Submission", text: "Prepare forms and supporting document sets.", href: "/claim-form-preparation-support" },
  { title: "Claim Follow-up Support", text: "Structured follow-up for pending claim decisions.", href: "/insurance-claim-follow-up" },
  { title: "Claim Rejection Review", text: "Review rejection reasons and prepare the next reply.", href: "/insurance-claim-rejected" },
  { title: "Settlement Documentation Assistance", text: "Settlement notes, deductions and discharge papers.", href: "/settlement-documentation-assistance" },
  { title: "Nominee Claim Assistance", text: "Identity, relationship, form and bank records.", href: "/nominee-claim-assistance" }
];

const insuranceClaimTypes = [
  { title: "Health Insurance Claims", href: "/health-insurance-claim-help" },
  { title: "Motor Insurance Claims", href: "/motor-insurance-claim-support" },
  { title: "Life Insurance Claims", href: "/life-insurance-claim-assistance" },
  { title: "Personal Accident Claims", href: "/personal-accident-insurance-claim" },
  { title: "Property / Fire Insurance Claims", href: "/property-insurance-claim-help" },
  { title: "Business Insurance Claims", href: "/property-insurance-claim-help" },
  { title: "Claim Rejection Cases", href: "/insurance-claim-rejected" },
  { title: "Delayed Settlement Cases", href: "/insurance-claim-follow-up" },
  { title: "Underpaid / Short Settlement Cases", href: "/settlement-documentation-assistance" },
  { title: "Nominee Claim Cases", href: "/nominee-claim-assistance" }
];

const insuranceTrustPoints = [
  "Easy WhatsApp support",
  "Secure document upload",
  "Clear process",
  "Local Odisha support",
  "Insurance, tax, GST and business documentation help",
  "Call-back from team",
  "Google Business Profile available",
  "Escalation support where required"
];

const insuranceAdProblems = [
  "Health insurance claim rejected",
  "Cashless claim denied",
  "Mediclaim reimbursement stuck",
  "Claim amount reduced / short settlement",
  "Motor insurance claim support",
  "Life insurance / nominee claim assistance",
  "Personal accident claim assistance",
  "Settlement documentation",
  "Claim follow-up with insurance company"
];

const crossSellServices = [
  {
    title: "Income Tax & ITR Filing",
    text: "Salary ITR, Form 16, AIS/Form 26AS review, refund support and tax notice help.",
    href: "/salary-itr-filing"
  },
  {
    title: "GST & Business Compliance",
    text: "GST registration, GST return filing, bookkeeping, TDS and business compliance support.",
    href: "/gst-services"
  },
  {
    title: "Tax & GST Notice Support",
    text: "Received a notice? Upload the document and our team will contact you.",
    href: "/tax-notice-help"
  },
  {
    title: "Loan, Subsidy & Project Reports",
    text: "Project reports, MSME/Udyam, business loan documents and subsidy documentation support.",
    href: "/loan-project-report"
  }
];

function ClaimSupportIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current"><path d="M12 3 5 6v5c0 4.5 2.7 8.1 7 10 4.3-1.9 7-5.5 7-10V6l-7-3Z" strokeWidth="1.8"/><path d="m9 12 2 2 4-5" strokeWidth="1.8"/></svg>;
}

function getDefaultServiceImage(service: Service) {
  if (service.category === "insurance" || service.slug.includes("insurance") || service.slug.includes("mediclaim") || service.slug.includes("cashless")) return siteConfig.images.insuranceClaim;
  if (service.slug.includes("notice")) return siteConfig.images.taxNotice;
  if (service.slug.includes("loan") || service.slug.includes("project") || service.slug.includes("subsidy")) return siteConfig.images.loanProject;
  if (service.slug.includes("gst")) return siteConfig.images.gstConsultation;
  if (service.slug.includes("itr") || service.category === "itr") return siteConfig.images.salaryItr;
  if (service.category === "business") return siteConfig.images.gstConsultation;
  if (service.category === "support") return siteConfig.images.mobileUpload;
  return siteConfig.images.salaryItr;
}

function getWhatsAppMessage(service: Service) {
  if (service.category === "insurance" || service.slug.includes("insurance") || service.slug.includes("mediclaim") || service.slug.includes("cashless")) return whatsappMessages.insurance;
  if (service.slug.includes("salary") || service.slug.includes("itr-1")) return whatsappMessages.salaryItr;
  if (service.slug.includes("gst")) return whatsappMessages.gst;
  if (service.slug.includes("notice")) return whatsappMessages.notice;
  if (service.slug.includes("loan") || service.slug.includes("project") || service.slug.includes("subsidy")) return whatsappMessages.loan;
  return `Hello VB Consultants, I need help with ${service.label}.`;
}

export function ServicePageTemplate({ service, heroImage }: { service: Service; heroImage?: string }) {
  const related = getRelatedServices(service.related).filter((item) => item.slug !== "upload-documents");
  const image = heroImage || getDefaultServiceImage(service);
  const isInsurance = service.category === "insurance";
  const isInsuranceMain = service.slug === "insurance-claim-support";

  return (
    <>
      <SEOJsonLd
        data={[
          getServiceSchema(service),
          getFAQSchema(service.faqs),
          getBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: service.label, path: `/${service.slug}` }
          ])
        ]}
      />
      <Breadcrumbs items={[{ name: service.label, href: `/${service.slug}` }]} />

      <section className="container-shell grid gap-10 pb-14 pt-8 lg:grid-cols-[1fr_420px] lg:items-start lg:pb-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">{service.category} support</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">{service.heroTitle}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-charcoal-700">{service.heroText}</p>
          {isInsuranceMain ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {insuranceAdProblems.slice(0, 5).map((item) => (
                <span key={item} className="rounded-full border border-brand-600/15 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">{item}</span>
              ))}
            </div>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedLink href={`/request-service?service=${service.slug}`} service={service.slug} eventLabel="service_hero_primary" className="inline-flex justify-center rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-red transition hover:bg-brand-700">
              {isInsuranceMain ? "Get Claim Help" : isInsurance ? "Start claim support" : "Start request"}
            </TrackedLink>
            <TrackedLink href={`/upload-documents?service=${service.slug}`} eventName="upload_documents_click" service={service.slug} eventLabel="service_hero_upload" className="inline-flex justify-center rounded-full border border-charcoal-900/10 bg-white px-6 py-3.5 text-sm font-semibold text-charcoal-900 shadow-soft transition hover:border-brand-600 hover:text-brand-700">
              {isInsurance ? "Upload Claim Documents" : "Upload Documents"}
            </TrackedLink>
            <WhatsAppButton message={getWhatsAppMessage(service)} service={service.slug} />
            {isInsuranceMain ? <PhoneLink service={service.slug} className="px-6 py-3.5">Call Now</PhoneLink> : null}
          </div>
          {isInsuranceMain ? (
            <p className="mt-4 text-base font-semibold text-charcoal-900">Phone: <a className="text-brand-700 hover:text-brand-800" href={`tel:${siteConfig.phone.replace(/[^\d+]/g, "")}`}>{siteConfig.phone}</a></p>
          ) : null}
          <div className="mt-8 overflow-hidden rounded-3xl border border-charcoal-900/10 bg-white shadow-premium">
            <div className="relative aspect-[4/3]">
              <Image src={image} alt={`${service.label} support`} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover object-center" priority />
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-3">
              {["Clear fee before work", "Secure upload", "Status tracking"].map((item) => (
                <div key={item} className="rounded-2xl border border-charcoal-900/10 bg-paper p-4 text-sm font-semibold text-charcoal-900">{item}</div>
              ))}
            </div>
          </div>
        </div>
        <GuestRequestForm defaultService={service.slug} />
      </section>

      {isInsuranceMain ? (
        <>
          <section className="sticky top-[72px] z-20 border-y border-charcoal-900/10 bg-white/95 py-3 shadow-sm backdrop-blur md:hidden">
            <div className="container-shell flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-charcoal-900">Need help with something else?</span>
              <Link href="/#services" className="shrink-0 rounded-full bg-charcoal-900 px-4 py-2 font-semibold text-white">View all services</Link>
            </div>
          </section>

          <section className="container-shell pb-16">
            <SectionHeader eyebrow="Cross-service help" title="VBC Bharat Also Helps With" description="Many users come for one urgent issue and later need tax, GST, notice or loan document support too." />
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {crossSellServices.map((item) => (
                <Link key={item.href} href={item.href} className="group rounded-3xl border border-charcoal-900/10 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-brand-600/30 hover:shadow-premium">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><ClaimSupportIcon /></span>
                  <h2 className="mt-4 text-lg font-semibold text-charcoal-900">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-charcoal-700">{item.text}</p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-brand-700">View Service</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="container-shell pb-16">
            <SectionHeader eyebrow="Insurance services" title="Complete claim support from documents to settlement" description="Choose the support you need today. Every service starts with a simple guest request and secure document upload." />
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {insuranceSupportServices.map((item) => (
                <Link key={item.href} href={item.href} className="group rounded-3xl border border-charcoal-900/10 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-brand-600/30 hover:shadow-premium">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><ClaimSupportIcon /></span>
                  <h2 className="mt-4 text-lg font-semibold text-charcoal-900">{item.title}</h2>
                  <p className="mt-2 text-base leading-7 text-charcoal-700">{item.text}</p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-brand-700">Get help</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-white/70 py-16">
            <div className="container-shell">
              <SectionHeader eyebrow="Claim types" title="Insurance claim problems we help with" description="Rejected does not always mean finished. Send us your claim papers and our team will guide the next action." />
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {insuranceClaimTypes.map((item) => (
                  <Link key={item.title} href={item.href} className="rounded-2xl border border-charcoal-900/10 bg-white p-5 shadow-soft transition hover:border-brand-600/30">
                    <span className="text-brand-700"><ClaimSupportIcon /></span>
                    <h3 className="mt-4 text-base font-semibold leading-6 text-charcoal-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-charcoal-700">Upload papers and review the next step.</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="container-shell section-padding">
            <SectionHeader eyebrow="Trust" title="Why People Contact VBC Bharat" description="Clear steps for urgent claim, tax, GST and business documentation problems." />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {insuranceTrustPoints.map((item) => (
                <div key={item} className="rounded-2xl border border-charcoal-900/10 bg-charcoal-900 p-5 text-white shadow-soft">
                  <span className="text-red-300"><ClaimSupportIcon /></span>
                  <p className="mt-4 text-base font-semibold leading-7">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {!isInsuranceMain ? <section className="bg-white/70 py-14">
        <div className="container-shell grid gap-8 lg:grid-cols-3">
          <div>
            <SectionHeader eyebrow="Who this helps" title="Built for simple mobile use." description="Choose the service, upload documents and track what is pending." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            {service.whoFor.map((item) => (
              <div key={item} className="rounded-2xl border border-charcoal-900/10 bg-white p-5 shadow-soft">
                <p className="text-sm leading-6 text-charcoal-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section> : null}

      {isInsuranceMain ? (
        <section className="bg-charcoal-900 py-16 text-white">
          <div className="container-shell">
            <SectionHeader eyebrow="Process" title="How insurance claim support works" description="From first document review through follow-up, escalation and settlement papers." className="text-white [&_h2]:text-white [&_p]:text-white/70" />
            <div className="mt-10"><ProcessSteps steps={service.process} /></div>
          </div>
        </section>
      ) : null}

      <section className="container-shell section-padding grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeader eyebrow="What we do" title="What is handled" description="Simple support without confusing language." />
          <ul className="mt-8 space-y-3">
            {service.whatWeDo.map((item) => (
              <li key={item} className="flex gap-3 rounded-2xl bg-white p-4 text-sm leading-6 text-charcoal-700 shadow-soft">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHeader eyebrow="Documents" title="Keep these ready" description="You can upload what you have now. Missing files can be added later." />
          <ul className="mt-8 grid gap-3">
            {service.documents.map((item) => (
              <li key={item} className="rounded-2xl border border-charcoal-900/10 bg-paper p-4 text-sm leading-6 text-charcoal-700">{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {!isInsuranceMain ? <section className="bg-charcoal-900 py-16 text-white">
        <div className="container-shell">
          <SectionHeader eyebrow="Process" title="How it works" description="Tell us the issue, upload what you have and let the work move forward." className="text-white [&_h2]:text-white [&_p]:text-white/70" />
          <div className="mt-10">
            <ProcessSteps steps={service.process} />
          </div>
        </div>
      </section> : null}

      <section className="container-shell section-padding">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeader eyebrow="Pricing note" title="Fee is confirmed before work starts" description={service.priceNote} />
          </div>
          <div>
            <SectionHeader eyebrow="FAQ" title="Common questions" />
            <div className="mt-6">
              <FAQAccordion faqs={service.faqs} />
            </div>
          </div>
        </div>
      </section>

      {isInsuranceMain ? (
        <section className="container-shell pb-16">
          <div className="rounded-3xl bg-charcoal-900 p-6 text-white shadow-premium md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-300">Contact VB Consultants</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">Need help with your insurance claim? Contact us today.</h2>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-base text-white/75">
                  <a href={`tel:${siteConfig.phone.replace(/[^\d+]/g, "")}`}>{siteConfig.phone}</a>
                  <a href={siteConfig.siteUrl}>www.vbcbharat.com</a>
                  <span>{siteConfig.address}</span>
                </div>
                {siteConfig.googleBusinessProfileUrl || siteConfig.googleMapsUrl || siteConfig.googleReviewUrl ? (
                  <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
                    {siteConfig.googleBusinessProfileUrl ? <a href={siteConfig.googleBusinessProfileUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-3 py-2 text-white/80 transition hover:text-white">View Google Profile</a> : null}
                    {siteConfig.googleMapsUrl ? <a href={siteConfig.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-3 py-2 text-white/80 transition hover:text-white">Find Us on Google Maps</a> : null}
                    {siteConfig.googleReviewUrl ? <a href={siteConfig.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-3 py-2 text-white/80 transition hover:text-white">Read Reviews</a> : null}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/request-service?service=insurance-claim-support" className="rounded-full bg-brand-600 px-7 py-4 text-center text-base font-semibold text-white">Get Insurance Claim Help</Link>
                <WhatsAppButton message={whatsappMessages.insurance} variant="light">Talk on WhatsApp</WhatsAppButton>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="bg-white/70 py-16">
          <div className="container-shell">
            <SectionHeader eyebrow="Related services" title="You may also need" description="Many paperwork tasks connect with each other." />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {related.slice(0, 3).map((item) => (
                <ServiceCard key={item.slug} service={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {isInsurance && !isInsuranceMain ? (
        <section className="container-shell pt-10">
          <div className="flex flex-col gap-4 rounded-2xl border border-charcoal-900/10 bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-charcoal-900">Need direct help with this claim?</p>
              <p className="mt-1 text-sm text-charcoal-700">Call {siteConfig.phone} or contact VB Consultants in Bhubaneswar.</p>
            </div>
            <Link href="/contact" className="inline-flex justify-center rounded-full border border-brand-600 px-6 py-3 text-sm font-semibold text-brand-700">Contact Us</Link>
          </div>
        </section>
      ) : null}

      <CTASection className="section-padding pt-0" />
    </>
  );
}
