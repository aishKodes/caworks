import type { Metadata } from "next";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DocumentUploadForm } from "@/components/DocumentUploadForm";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Upload Documents",
  description: "Upload documents for your request.",
  path: "/dashboard/upload",
  noIndex: true
});

export default function DashboardUploadPage({ searchParams }: { searchParams: Promise<{ requestId?: string }> }) {
  return (
    <DashboardLayout>
      <UploadContent searchParams={searchParams} />
    </DashboardLayout>
  );
}

async function UploadContent({ searchParams }: { searchParams: Promise<{ requestId?: string }> }) {
  const params = await searchParams;
  return <DocumentUploadForm requestId={params.requestId} checklistType="salary" />;
}
