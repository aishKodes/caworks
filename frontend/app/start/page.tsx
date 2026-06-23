import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GuestRequestForm } from "@/components/GuestRequestForm";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Get Tax, Insurance Claim and Business Support",
  description: "Start ITR, GST, insurance claim, notice, loan or business paperwork support without creating an account.",
  path: "/start",
  noIndex: true
});

export default function StartPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Start", href: "/start" }]} />
      <section className="container-shell grid gap-8 pb-16 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Start</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">Start your tax, claim or paperwork request.</h1>
          <p className="mt-5 text-lg leading-8 text-muted">Enter your name and phone number. No account or password is required. Upload documents after your request is created.</p>
        </div>
        <GuestRequestForm defaultService="salary-itr-filing" />
      </section>
    </>
  );
}
