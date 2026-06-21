import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StatusTimeline } from "@/components/StatusTimeline";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { siteConfig, whatsappMessages } from "@/data/site.config";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Track Status",
  description: "Login to track request, document, payment and filing status.",
  path: "/track-status",
  noIndex: true
});

export default function TrackStatusPage() {
  return (
    <section className="container-shell grid gap-8 pb-16 pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Track</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">Track your request status.</h1>
        <p className="mt-5 text-lg leading-8 text-charcoal-700">Login with phone, email or Tax Help ID to see documents, payment and work status.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/login" className="rounded-full bg-brand-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-red">Login to track</Link>
          <Link href="/quick-contact" className="rounded-full border border-charcoal-900/10 px-6 py-3 text-center text-sm font-semibold text-charcoal-900">Enter phone number</Link>
          <WhatsAppButton message={whatsappMessages.support}>WhatsApp Support</WhatsAppButton>
        </div>
        <div className="mt-8 overflow-hidden rounded-3xl border border-charcoal-900/10 bg-white shadow-premium">
          <Image src={siteConfig.images.paymentTracking} alt="Payment and request status tracking" width={900} height={650} priority className="aspect-[4/3] h-auto w-full object-cover object-center" />
        </div>
      </div>
      <div className="rounded-3xl border border-charcoal-900/10 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-charcoal-900">Status timeline example</h2>
        <div className="mt-5">
          <StatusTimeline currentStatus="Documents received" />
        </div>
      </div>
    </section>
  );
}
