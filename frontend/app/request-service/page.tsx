import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { serviceOptions } from "@/data/services";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Request Service",
  description: "Start a tax, GST, loan or business paperwork request.",
  path: "/request-service",
  noIndex: true
});

export default async function RequestServicePage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const params = await searchParams;
  const service = serviceOptions.some((option) => option.value === params.service) ? params.service : "salary-itr-filing";

  return (
    <>
      <Breadcrumbs items={[{ name: "Request Service", href: "/request-service" }]} />
      <section className="container-shell grid gap-8 pb-16 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Start request</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">Tell us what help you need.</h1>
          <p className="mt-5 text-lg leading-8 text-muted">
            Choose the service, add a short message and continue to document upload. If you are not logged in, we will help you create an account first.
          </p>
        </div>
        <ServiceRequestForm defaultService={service} />
      </section>
    </>
  );
}
