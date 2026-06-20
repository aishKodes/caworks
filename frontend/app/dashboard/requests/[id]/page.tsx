import type { Metadata } from "next";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RequestDetailClient } from "@/components/RequestDetailClient";
import { buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = buildMetadata({
  title: "Request Details",
  description: "View request details, documents, payment and status timeline.",
  path: "/dashboard/requests",
  noIndex: true
});

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <DashboardLayout>
      <RequestDetailClient id={id} />
    </DashboardLayout>
  );
}
