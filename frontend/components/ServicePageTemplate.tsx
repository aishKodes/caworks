import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { ProcessSteps } from "@/components/ProcessSteps";
import { SEOJsonLd } from "@/components/SEOJsonLd";
import { SectionHeader } from "@/components/SectionHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getRelatedServices, type Service } from "@/data/services";
import { siteConfig } from "@/data/site.config";
import { getBreadcrumbSchema, getFAQSchema, getServiceSchema } from "@/lib/schema";

function getDefaultServiceImage(service: Service) {
  if (service.slug.includes("notice")) return siteConfig.images.taxNotice;
  if (service.slug.includes("loan") || service.slug.includes("project") || service.slug.includes("subsidy")) return siteConfig.images.loanProject;
  if (service.slug.includes("gst")) return siteConfig.images.gstConsultation;
  if (service.slug.includes("itr") || service.category === "itr") return siteConfig.images.salaryItr;
  if (service.category === "business") return siteConfig.images.gstConsultation;
  if (service.category === "support") return siteConfig.images.mobileUpload;
  return siteConfig.images.salaryItr;
}

export function ServicePageTemplate({ service, heroImage }: { service: Service; heroImage?: string }) {
  const related = getRelatedServices(service.related).filter((item) => item.slug !== "upload-documents");
  const image = heroImage || getDefaultServiceImage(service);

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
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/start" className="inline-flex justify-center rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-red transition hover:bg-brand-700">
              Start request
            </Link>
            <Link href="/upload-documents" className="inline-flex justify-center rounded-full border border-charcoal-900/10 bg-white px-6 py-3.5 text-sm font-semibold text-charcoal-900 shadow-soft transition hover:border-brand-600 hover:text-brand-700">
              Upload Documents
            </Link>
            <WhatsAppButton message={`Hello, I need help with ${service.label}.`} />
          </div>
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
        <ServiceRequestForm defaultService={service.slug} />
      </section>

      <section className="bg-white/70 py-14">
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
      </section>

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

      <section className="bg-charcoal-900 py-16 text-white">
        <div className="container-shell">
          <SectionHeader eyebrow="Process" title="How it works" description="Start, upload, pay and track from your phone." className="text-white [&_h2]:text-white [&_p]:text-white/70" />
          <div className="mt-10">
            <ProcessSteps steps={service.process} />
          </div>
        </div>
      </section>

      <section className="container-shell section-padding">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeader eyebrow="Pricing note" title="Fee is confirmed before work starts" description={service.priceNote} />
            <div className="mt-6 rounded-2xl bg-brand-50 p-5 text-sm leading-7 text-brand-900">
              Final fee depends on documents, income sources and complexity. We do not make false refund promises.
            </div>
          </div>
          <div>
            <SectionHeader eyebrow="FAQ" title="Common questions" />
            <div className="mt-6">
              <FAQAccordion faqs={service.faqs} />
            </div>
          </div>
        </div>
      </section>

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

      <CTASection className="section-padding pt-0" />
    </>
  );
}
