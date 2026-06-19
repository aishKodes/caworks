import Link from "next/link";
import Image from "next/image";
import { QuickLeadForm } from "@/components/QuickLeadForm";
import { siteConfig } from "@/data/site.config";

const trustLine = ["Secure upload", "Razorpay payment", "No false refund promises"];
const heroCards = [
  ["Salary ITR launch", "₹199 onwards", "Final fee depends on documents."],
  ["Request status", "Track from phone", "Upload, pay and follow updates."]
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
      <div className="container-shell grid gap-12 pb-16 pt-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:pb-24 lg:pt-20">
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

        <div className="grid gap-5">
          <div className="relative rounded-[2rem] border border-charcoal-900/10 bg-white p-2 shadow-premium">
            <div className="relative min-h-[300px] overflow-hidden rounded-[1.55rem] bg-charcoal-900 sm:min-h-[420px] lg:min-h-[520px]">
            <Image
              src={image}
              alt="Professional paperwork support desk"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover"
            />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:absolute lg:-bottom-6 lg:left-8 lg:right-8 lg:mt-0">
              {heroCards.map(([label, value, note], index) => (
                <div key={label} className={`rounded-2xl border p-4 shadow-premium ${index === 0 ? "border-brand-600/20 bg-white text-charcoal-900" : "border-white/15 bg-charcoal-900 text-white"}`}>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${index === 0 ? "text-brand-600" : "text-white/55"}`}>{label}</p>
                  <p className="mt-2 text-xl font-semibold">{value}</p>
                  <p className={`mt-2 text-xs leading-5 ${index === 0 ? "text-muted" : "text-white/65"}`}>{note}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:pt-8">
            <QuickLeadForm sourcePage="homepage-hero" compact />
          </div>
        </div>
      </div>
    </section>
  );
}
