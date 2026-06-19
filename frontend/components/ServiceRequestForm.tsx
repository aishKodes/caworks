"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { serviceOptions } from "@/data/services";
import { createServiceRequest } from "@/lib/api";

const inputClass =
  "mt-2 w-full rounded-2xl border border-charcoal-900/10 bg-white px-4 py-3 text-sm text-charcoal-900 shadow-sm transition placeholder:text-muted/70 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10";
const incomeTypes = ["Salary / pension", "Capital gains", "Freelancer", "Business", "GST", "Loan paperwork", "Not sure"];

export function ServiceRequestForm({ defaultService = "salary-itr-filing" }: { defaultService?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setStatus("loading");
    const result = await createServiceRequest({
      serviceType: String(formData.get("serviceType") || ""),
      incomeType: String(formData.get("incomeType") || ""),
      city: String(formData.get("city") || ""),
      details: String(formData.get("details") || "")
    });

    if (result.ok && result.data?.request?.id) {
      router.push(`/dashboard/upload?requestId=${result.data.request.id}`);
      return;
    }

    setStatus("error");
    setMessage(result.message || "Please login or create an account before starting a request.");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-charcoal-900/10 bg-white p-5 shadow-soft md:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">New request</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-charcoal-900">Choose what you need.</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-charcoal-900">
          Service needed
          <select name="serviceType" className={inputClass} defaultValue={defaultService}>
            {serviceOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-charcoal-900">
          Income or business type
          <select name="incomeType" className={inputClass} defaultValue="Salary / pension">
            {incomeTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-charcoal-900">
          City
          <input name="city" className={inputClass} placeholder="Bhubaneswar" />
        </label>
        <label className="text-sm font-semibold text-charcoal-900 sm:col-span-2">
          Short message
          <textarea name="details" className={`${inputClass} min-h-28 resize-y`} placeholder="Add any detail you want us to know" />
        </label>
      </div>
      <button disabled={status === "loading"} className="mt-6 w-full rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-red transition hover:bg-brand-700 disabled:opacity-70">
        {status === "loading" ? "Creating..." : "Continue to upload"}
      </button>
      <p aria-live="polite" className="mt-4 min-h-6 text-sm font-medium text-brand-700">{message}</p>
    </form>
  );
}
