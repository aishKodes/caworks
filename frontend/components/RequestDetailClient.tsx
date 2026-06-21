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

  const groupedDocuments = (request.documents || []).reduce<Record<string, NonNullable<ServiceRequestDetail["documents"]>>>((groups, doc) => {
    const label = doc.document_label || doc.document_type || "Document";
    groups[label] = groups[label] || [];
    groups[label].push(doc);
    return groups;
  }, {});

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
          <div className="mt-4 grid gap-3">
            {Object.keys(groupedDocuments).length ? Object.entries(groupedDocuments).map(([label, docs]) => (
              <section key={label} className="rounded-2xl bg-paper p-4">
                <h3 className="text-sm font-semibold text-charcoal-900">{label}</h3>
                <div className="mt-3 grid gap-2">
                  {docs.map((doc) => (
                    <div key={doc.id} className="rounded-xl bg-white px-3 py-2 text-sm text-charcoal-700">
                      <span className="font-medium">{doc.original_name}</span>
                      <span className="block text-xs text-muted">{Math.max(1, Math.round(doc.size / 1024))} KB · {doc.uploaded_at || doc.created_at}</span>
                    </div>
                  ))}
                </div>
              </section>
            )) : <p className="text-sm text-muted">No documents uploaded yet.</p>}
          </div>
        </div>
      </div>
      <PaymentChoice requestId={String(request.id)} amount={Number(request.quoted_amount || 499)} />
    </div>
  );
}
