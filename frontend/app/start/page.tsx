import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { SignupForm } from "@/components/SignupForm";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Start ITR Filing",
  description: "Choose service type, create an account and continue to document upload.",
  path: "/start",
  noIndex: true
});

export default function StartPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Start", href: "/start" }]} />
      <section className="container-shell grid gap-8 pb-16 pt-8 lg:grid-cols-[1fr_0.95fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Start</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">Start ITR filing or another paperwork request.</h1>
          <p className="mt-5 text-lg leading-8 text-muted">First create your account. Then choose the request and upload documents.</p>
          <div className="mt-8">
            <SignupForm />
          </div>
        </div>
        <ServiceRequestForm defaultService="salary-itr-filing" />
      </section>
    </>
  );
}
