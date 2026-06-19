import Link from "next/link";
import type { ServiceRequestSummary } from "@/lib/api";

export function RequestCard({ request }: { request: ServiceRequestSummary }) {
  return (
    <article className="rounded-2xl border border-charcoal-900/10 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{request.request_code}</p>
          <h3 className="mt-2 text-lg font-semibold text-charcoal-900">{request.service_type}</h3>
          <p className="mt-1 text-sm text-muted">{new Date(request.created_at).toLocaleDateString("en-IN")}</p>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{request.status}</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/dashboard/requests/${request.id}`} className="rounded-full bg-charcoal-900 px-4 py-2 text-sm font-semibold text-white">View details</Link>
        <Link href={`/dashboard/upload?requestId=${request.id}`} className="rounded-full border border-charcoal-900/10 px-4 py-2 text-sm font-semibold text-charcoal-900">Upload missing documents</Link>
        <Link href={`/dashboard/payment/${request.id}`} className="rounded-full border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700">Payment</Link>
      </div>
    </article>
  );
}
