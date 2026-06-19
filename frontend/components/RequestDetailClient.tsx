"use client";

import { useEffect, useState } from "react";
import { PaymentChoice } from "@/components/PaymentChoice";
import { StatusTimeline } from "@/components/StatusTimeline";
import { getRequest, type ServiceRequestDetail } from "@/lib/api";

export function RequestDetailClient({ id }: { id: string }) {
  const [request, setRequest] = useState<ServiceRequestDetail | null>(null);
  const [message, setMessage] = useState("Loading request...");

  useEffect(() => {
    getRequest(id).then((result) => {
      if (result.ok && result.data) {
        setRequest(result.data);
        setMessage("");
      } else {
        setMessage(result.message || "Could not load request.");
      }
    });
  }, [id]);

  if (!request) {
    return <div className="rounded-2xl bg-white p-6 shadow-soft">{message}</div>;
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-charcoal-900/10 bg-white p-6 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{request.request_code}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal-900">{request.service_type}</h1>
        <p className="mt-2 text-sm text-muted">Status: {request.status}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-charcoal-900/10 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-charcoal-900">Status timeline</h2>
          <div className="mt-5">
            <StatusTimeline currentStatus={request.status} />
          </div>
        </div>
        <div className="rounded-3xl border border-charcoal-900/10 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-charcoal-900">Documents</h2>
          <div className="mt-4 grid gap-2">
            {request.documents?.length ? request.documents.map((doc) => (
              <div key={doc.id} className="rounded-2xl bg-paper p-3 text-sm text-charcoal-700">{doc.document_type}: {doc.original_name}</div>
            )) : <p className="text-sm text-muted">No documents uploaded yet.</p>}
          </div>
        </div>
      </div>
      <PaymentChoice requestId={String(request.id)} amount={Number(request.quoted_amount || 499)} />
    </div>
  );
}
