"use client";

import { useEffect, useState } from "react";
import { getMyRequests, type ServiceRequestSummary } from "@/lib/api";
import { RequestCard } from "@/components/RequestCard";

export function RequestsClient() {
  const [requests, setRequests] = useState<ServiceRequestSummary[]>([]);
  const [message, setMessage] = useState("Loading requests...");

  useEffect(() => {
    getMyRequests().then((result) => {
      if (result.ok && result.data) {
        setRequests(result.data);
        setMessage(result.data.length ? "" : "No requests found.");
      } else {
        setMessage(result.message || "Could not load requests.");
      }
    });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-charcoal-900">My requests</h1>
      <div className="mt-6 grid gap-4">
        {requests.map((request) => <RequestCard key={request.id} request={request} />)}
        {message ? <div className="rounded-2xl border border-charcoal-900/10 bg-white p-6 text-sm text-muted shadow-soft">{message}</div> : null}
      </div>
    </div>
  );
}
