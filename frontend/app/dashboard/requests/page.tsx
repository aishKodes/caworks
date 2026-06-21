import type { Metadata } from "next";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RequestsClient } from "@/components/RequestsClient";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "My Requests",
  description: "View tax and paperwork requests.",
  path: "/dashboard/requests",
  noIndex: true
});

export default function RequestsPage() {
  return (
    <DashboardLayout>
      <RequestsClient />
    </DashboardLayout>
  );
}
