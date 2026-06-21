import type { Metadata } from "next";
import { DashboardHome } from "@/components/DashboardHome";
import { DashboardLayout } from "@/components/DashboardLayout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Dashboard",
  description: "User dashboard for requests, documents, payments and status timeline.",
  path: "/dashboard",
  noIndex: true
});

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardHome />
    </DashboardLayout>
  );
}
