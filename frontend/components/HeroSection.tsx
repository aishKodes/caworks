import Link from "next/link";
import Image from "next/image";
import { QuickLeadForm } from "@/components/QuickLeadForm";
import { siteConfig } from "@/data/site.config";

const trustLine = "Upload documents · Pay securely · Track status · Get WhatsApp support";

export function HeroSection({
  title = "Tax, GST and business paperwork made simple",
  subtitle = "From ITR filing to GST, notices, loans and business paperwork — get simple support from your phone.",
  primaryCtaLabel = "Start ITR Filing",
  primaryCtaHref = "/start",
  secondaryCtaLabel = "Request Call Back",
  secondaryCtaHref = "/quick-contact",
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
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_8%,rgba(164,22,36,0.10),transparent_28rem),linear-gradient(135deg,#fffaf7_0%,#ffffff_48%,#f7f4f1_100%)]" />
      <div className="container-shell grid gap-9 pb-14 pt-10 lg:grid-cols-[0.98fr_1.02fr] lg:items-center lg:gap-12 lg:pb-20 lg:pt-16">
        <div className="max-w-2xl">
          <p className="inline-flex rounded-full border border-brand-600/20 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-700 shadow-soft backdrop-blur">
            {siteConfig.tagline}
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-charcoal-900 sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={primaryCtaHref} className="inline-flex justify-center rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-red transition hover:bg-brand-700">
              {primaryCtaLabel}
            </Link>
            <Link href={secondaryCtaHref} className="inline-flex justify-center rounded-full border border-charcoal-900/10 bg-white px-6 py-3.5 text-sm font-semibold text-charcoal-900 shadow-soft transition hover:border-brand-600 hover:text-brand-700">
              {secondaryCtaLabel}
            </Link>
          </div>
          <div className="mt-6 rounded-2xl border border-charcoal-900/10 bg-white/80 px-4 py-3 text-sm font-semibold leading-6 text-charcoal-700 shadow-sm backdrop-blur">
            {trustLine}
          </div>
          <div className="mt-6 max-w-md">
            <QuickLeadForm sourcePage="homepage-hero" compact />
          </div>
        </div>

        <div className="relative rounded-[2rem] border border-charcoal-900/10 bg-white p-2 shadow-premium">
          <div className="relative min-h-[300px] overflow-hidden rounded-[1.55rem] bg-charcoal-900 sm:min-h-[430px] lg:min-h-[560px]">
            <Image
              src={image}
              alt="Indian family using phone for tax and business paperwork support"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover object-[62%_center]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
