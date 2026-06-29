import Image from "next/image";
import { GuestRequestForm } from "@/components/GuestRequestForm";
import { TrackedLink } from "@/components/TrackedLink";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { heroServiceOptions } from "@/data/services";
import { siteConfig, whatsappMessages } from "@/data/site.config";

const trustLine = "Guest request · Secure document upload · Clear next steps · WhatsApp support";

export function HeroSection({
  title = "Tax, GST, Business & Insurance Claim Support Made Simple",
  subtitle = "From ITR filing and GST compliance to rejected insurance claims and business paperwork, VB Consultants helps you take the next step quickly and professionally.",
  primaryCtaLabel = "Get Help Now",
  primaryCtaHref = "#get-help",
  secondaryCtaLabel = "Upload Documents",
  secondaryCtaHref = "/upload-documents",
  image = siteConfig.images.heroPremium
}: {
  title?: string;
  subtitle?: string;
  image?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#fffaf7_0%,#ffffff_52%,#f5f3f1_100%)]" />
      <div className="container-shell grid min-w-0 gap-9 pb-14 pt-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-12 lg:pb-20 lg:pt-16">
        <div className="min-w-0 max-w-[20.5rem] sm:max-w-2xl">
          <p className="inline-flex max-w-full whitespace-normal rounded-full border border-brand-600/20 bg-white/90 px-4 py-2 text-xs font-bold uppercase leading-5 tracking-[0.14em] text-brand-700 shadow-soft backdrop-blur sm:tracking-[0.18em]">
            {siteConfig.tagline}
          </p>
          <h1 className="mt-6 break-words text-3xl font-semibold tracking-tight text-charcoal-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl break-words text-lg leading-8 text-muted">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <TrackedLink href={primaryCtaHref} eventName="service_cta_click" service="not-sure" eventLabel="hero_primary" className="inline-flex justify-center rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-red transition hover:bg-brand-700">
              {primaryCtaLabel}
            </TrackedLink>
            <TrackedLink href={secondaryCtaHref} eventName="upload_documents_click" service="not-sure" eventLabel="hero_secondary" className="inline-flex justify-center rounded-full border border-charcoal-900/10 bg-white px-6 py-3.5 text-sm font-semibold text-charcoal-900 shadow-soft transition hover:border-brand-600 hover:text-brand-700">
              {secondaryCtaLabel}
            </TrackedLink>
            <WhatsAppButton message={whatsappMessages.homepage} className="px-6 py-3.5" variant="solid" service="homepage">
              Talk on WhatsApp
            </WhatsAppButton>
          </div>
          <div className="mt-6 max-w-full break-words rounded-2xl border border-charcoal-900/10 bg-white/80 px-4 py-3 text-sm font-semibold leading-6 text-charcoal-700 shadow-sm backdrop-blur">
            {trustLine}
          </div>
        </div>

        <div className="min-w-0 space-y-5">
          <div className="relative min-w-0 rounded-[2rem] border border-charcoal-900/10 bg-white p-2 shadow-premium">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.55rem] bg-charcoal-900">
              <Image
                src={image}
                alt="Indian family using phone for tax, claim and business paperwork support"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-[62%_center]"
              />
            </div>
          </div>
          <div id="get-help" className="scroll-mt-28">
            <GuestRequestForm defaultService="not-sure" variant="hero" options={heroServiceOptions} />
          </div>
        </div>
      </div>
    </section>
  );
}
