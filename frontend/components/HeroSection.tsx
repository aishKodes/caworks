import Link from "next/link";
import Image from "next/image";
import { QuickLeadForm } from "@/components/QuickLeadForm";
import { siteConfig } from "@/data/site.config";

const trustLine = ["Secure upload", "Razorpay payment", "Manual payment option", "WhatsApp updates", "No false refund promises"];
const statusCards = [
  ["Request ID", "REQ-284917"],
  ["Documents", "Received"],
  ["Payment", "Pending"],
  ["Review", "Queued"],
  ["Filing status", "Next step ready"],
  ["WhatsApp update", "Prepared"]
];

export function HeroSection({
  title = "Tax, GST and business paperwork made simple for Indian families and businesses.",
  subtitle = "File ITR, get GST help, upload documents, pay securely and track your request — all from your phone.",
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
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(164,22,36,0.13),transparent_32rem),linear-gradient(135deg,#fffaf7_0%,#ffffff_48%,#f5f1ed_100%)]" />
      <div className="container-shell grid gap-10 pb-14 pt-12 lg:grid-cols-[1fr_0.96fr] lg:items-center lg:pb-20 lg:pt-20">
        <div>
          <p className="inline-flex rounded-full border border-brand-600/20 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-700 shadow-soft backdrop-blur">
            {siteConfig.name}
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-charcoal-900 sm:text-5xl lg:text-6xl">
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
          <div className="mt-7 flex flex-wrap gap-2 text-sm font-semibold text-charcoal-700">
            {trustLine.map((item) => (
              <span key={item} className="rounded-full border border-charcoal-900/10 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">{item}</span>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr] lg:items-stretch">
          <div className="relative min-h-[500px] overflow-hidden rounded-[2rem] border border-charcoal-900/10 bg-charcoal-900 shadow-premium">
            <Image
              src={image}
              alt="Professional paperwork support desk"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/35 to-transparent" />
            <div className="absolute left-4 right-4 top-4 rounded-3xl border border-white/15 bg-white/92 p-4 text-charcoal-900 shadow-premium backdrop-blur md:left-6 md:right-6 md:top-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Live request desk</p>
                  <p className="mt-1 text-2xl font-semibold">TAX-583921</p>
                </div>
                <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">Active</span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {statusCards.map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-charcoal-900/10 bg-paper/80 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">{title}</p>
                    <p className="mt-1 text-sm font-semibold">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-3xl border border-white/15 bg-charcoal-900/86 p-4 text-white shadow-premium backdrop-blur md:bottom-6 md:left-6 md:right-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">Salary ITR launch</p>
                  <p className="mt-1 text-2xl font-semibold">₹199 onwards</p>
                </div>
                <Link href="/salary-itr-filing" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-charcoal-900">View</Link>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/70">Final fee depends on documents, income type and complexity.</p>
            </div>
          </div>
          <div className="self-center lg:-ml-12">
            <QuickLeadForm sourcePage="homepage-hero" compact />
          </div>
        </div>
      </div>
    </section>
  );
}
