import type { Metadata } from "next";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PaymentChoice } from "@/components/PaymentChoice";
import { buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ requestId: string }> };

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Payment",
  description: "Choose Razorpay online payment or manual payment screenshot.",
  path: "/dashboard/payment",
  noIndex: true
});

export default async function PaymentPage({ params }: PageProps) {
  const { requestId } = await params;
  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h1 className="text-3xl font-semibold tracking-tight text-charcoal-900">Choose payment mode</h1>
          <p className="mt-3 text-sm leading-6 text-muted">Use Razorpay online payment or upload a manual payment screenshot.</p>
        </div>
        <PaymentChoice requestId={requestId} amount={499} />
      </div>
    </DashboardLayout>
  );
}
