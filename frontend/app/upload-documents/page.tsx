import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { DocumentUploadForm } from "@/components/DocumentUploadForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { siteConfig, whatsappMessages } from "@/data/site.config";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Upload Documents",
  description: "Upload tax, GST and business paperwork documents securely.",
  path: "/upload-documents",
  noIndex: true
});

export default async function UploadDocumentsPage({ searchParams }: { searchParams: Promise<{ service?: string; requestId?: string }> }) {
  const params = await searchParams;
  return (
    <>
      <Breadcrumbs items={[{ name: "Upload Documents", href: "/upload-documents" }]} />
      <section className="container-shell grid gap-10 pb-16 pt-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Secure upload</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">Upload documents from your phone.</h1>
          <p className="mt-5 text-lg leading-8 text-charcoal-700">Take a photo or upload PDF files. You can also send documents on WhatsApp if you need help.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton message={whatsappMessages.documentUpload}>Send Documents on WhatsApp</WhatsAppButton>
          </div>
          <div className="mt-8 overflow-hidden rounded-3xl border border-charcoal-900/10 bg-white shadow-premium">
            <Image src={siteConfig.images.mobileUpload} alt="Uploading documents from a phone" width={900} height={650} priority className="aspect-[4/3] h-auto w-full object-cover object-center" />
          </div>
        </div>
        <DocumentUploadForm checklistType="salary" initialServiceSlug={params.service} requestId={params.requestId} />
      </section>
      <CTASection className="pb-16" />
    </>
  );
}
