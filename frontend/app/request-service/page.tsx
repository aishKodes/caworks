import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GuestRequestForm } from "@/components/GuestRequestForm";
import { serviceOptions } from "@/data/services";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Request Service",
  description: "Start a tax, GST, insurance claim, loan or business paperwork request.",
  path: "/request-service",
  noIndex: true
});

export default async function RequestServicePage({ searchParams }: { searchParams: Promise<{ service?: string; intent?: string }> }) {
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
            Start with your name and phone number. No account or password is required. You can upload documents after the request is created.
          </p>
        </div>
        <GuestRequestForm defaultService={service} intent={params.intent === "upload_documents" ? "upload_documents" : "service_request"} />
      </section>
    </>
  );
}
