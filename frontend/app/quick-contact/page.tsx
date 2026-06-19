import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { QuickLeadForm } from "@/components/QuickLeadForm";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Quick Contact",
  description: "Enter your phone number and request a call or WhatsApp message for tax and paperwork help.",
  path: "/quick-contact"
});

export default function QuickContactPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Quick Contact", href: "/quick-contact" }]} />
      <section className="container-shell grid gap-8 pb-16 pt-8 lg:grid-cols-[1fr_420px] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">No signup needed</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">You can also just enter your phone number.</h1>
          <p className="mt-5 text-lg leading-8 text-muted">We will contact you on phone or WhatsApp. Use this if you are not ready to create an account.</p>
        </div>
        <QuickLeadForm sourcePage="quick-contact" />
      </section>
    </>
  );
}
