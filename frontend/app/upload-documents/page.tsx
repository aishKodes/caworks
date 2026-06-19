import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { DocumentUploadForm } from "@/components/DocumentUploadForm";
import { siteConfig } from "@/data/site.config";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Upload Documents",
  description: "Upload tax, GST and business paperwork documents securely.",
  path: "/upload-documents"
});

export default function UploadDocumentsPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Upload Documents", href: "/upload-documents" }]} />
      <section className="container-shell grid gap-10 pb-16 pt-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Secure upload</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">Upload documents from your phone.</h1>
          <p className="mt-5 text-lg leading-8 text-muted">You can upload files after login. Direct public upload also shows graceful errors if backend is not configured.</p>
          <div className="mt-8 overflow-hidden rounded-3xl border border-charcoal-900/10 bg-white shadow-premium">
            <Image src={siteConfig.images.documentUpload} alt="Document upload placeholder" width={900} height={650} priority className="h-[320px] w-full object-cover" />
          </div>
        </div>
        <DocumentUploadForm checklistType="salary" />
      </section>
      <CTASection className="pb-16" />
    </>
  );
}
