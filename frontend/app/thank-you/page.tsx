import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ThankYouActions } from "@/components/ThankYouActions";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Request Received",
  description: "Your request has been received by VB Consultants.",
  path: "/thank-you",
  noIndex: true
});

export default async function ThankYouPage({
  searchParams
}: {
  searchParams: Promise<{ service?: string; request?: string; source?: string }>;
}) {
  const params = await searchParams;
  const service = params.service || "insurance-claim-support";
  const isInsurance = service.includes("insurance") || service.includes("claim") || service.includes("mediclaim") || service.includes("cashless");

  return (
    <>
      <Breadcrumbs items={[{ name: "Thank You", href: "/thank-you" }]} />
      <section className="container-shell pb-16 pt-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-charcoal-900/10 bg-white p-6 shadow-premium md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-green-700">Request received</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">Your request has been received.</h1>
          <p className="mt-5 text-lg leading-8 text-charcoal-700">
            Thank you. Our team will contact you on phone or WhatsApp.
          </p>
          {params.request ? (
            <div className="mt-6 rounded-2xl bg-paper p-4">
              <p className="text-sm font-semibold text-charcoal-700">Request ID</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-charcoal-900">{params.request}</p>
            </div>
          ) : null}
          {isInsurance ? (
            <p className="mt-5 rounded-2xl border border-brand-600/15 bg-brand-50 p-4 text-base font-semibold leading-7 text-brand-800">
              You can upload policy copy, rejection letter and claim papers now.
            </p>
          ) : null}
          <ThankYouActions service={service} requestId={params.request} source={params.source} />
          <div className="mt-8 border-t border-charcoal-900/10 pt-6">
            <p className="text-sm font-semibold text-charcoal-900">Need a different service?</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/salary-itr-filing" className="text-brand-700 hover:text-brand-800">ITR Filing</Link>
              <Link href="/gst-services" className="text-brand-700 hover:text-brand-800">GST Help</Link>
              <Link href="/tax-notice-help" className="text-brand-700 hover:text-brand-800">Notice Support</Link>
              <Link href="/loan-project-report" className="text-brand-700 hover:text-brand-800">Loan Project Report</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
