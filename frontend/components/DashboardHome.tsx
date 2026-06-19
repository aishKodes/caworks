"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMe, getMyRequests, type ServiceRequestSummary, type UserSummary } from "@/lib/api";
import { RequestCard } from "@/components/RequestCard";

export function DashboardHome() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [requests, setRequests] = useState<ServiceRequestSummary[]>([]);

  useEffect(() => {
    getMe().then((result) => {
      if (result.ok && result.data) setUser(result.data);
    });
    getMyRequests().then((result) => {
      if (result.ok && result.data) setRequests(result.data);
    });
  }, []);

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl bg-charcoal-900 p-6 text-white shadow-premium">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-100">Welcome</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Hello {user?.full_name || "there"}.</h1>
        <p className="mt-3 text-white/70">Your Tax Help ID is {user?.tax_help_id || "loading..."}. Use it for support and tracking.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/start" className="rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-charcoal-900">Start new request</Link>
          <Link href="/dashboard/upload" className="rounded-full border border-white/25 px-5 py-3 text-center text-sm font-semibold text-white">Upload missing documents</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Requests", requests.length],
          ["Documents", "Upload"],
          ["Payment", "Track"],
          ["Profile", "Ready"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-charcoal-900/10 bg-white p-5 shadow-soft">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-charcoal-900">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight text-charcoal-900">My requests</h2>
          <Link href="/dashboard/requests" className="text-sm font-semibold text-brand-700">View all</Link>
        </div>
        <div className="mt-5 grid gap-4">
          {requests.length ? requests.slice(0, 3).map((request) => <RequestCard key={request.id} request={request} />) : (
            <div className="rounded-2xl border border-charcoal-900/10 bg-white p-6 text-sm text-muted shadow-soft">
              No requests yet. Start ITR filing or choose another service.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
