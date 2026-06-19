"use client";

import { FormEvent, useState } from "react";
import { siteConfig } from "@/data/site.config";
import { submitManualPayment } from "@/lib/api";

export function ManualPaymentUpload({ requestId, amount }: { requestId: string; amount: number }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setStatus("loading");
    const result = await submitManualPayment(formData);

    if (result.ok) {
      event.currentTarget.reset();
      setStatus("success");
      setMessage("Payment screenshot received. We will verify and update your status.");
    } else {
      setStatus("error");
      setMessage(result.message || "Could not upload screenshot.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-charcoal-900/10 bg-white p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-charcoal-900">Manual payment screenshot</h3>
      <p className="mt-2 text-sm leading-6 text-muted">Pay using the UPI ID shown below, then upload payment screenshot.</p>
      <div className="mt-4 rounded-2xl bg-paper p-4 text-sm leading-6 text-charcoal-700">
        <p><span className="font-semibold text-charcoal-900">Amount:</span> ₹{amount}</p>
        <p><span className="font-semibold text-charcoal-900">UPI ID:</span> {siteConfig.upiId}</p>
      </div>
      <input type="hidden" name="request_id" value={requestId} />
      <input type="hidden" name="amount" value={amount} />
      <label className="mt-4 block text-sm font-semibold text-charcoal-900">
        Payment screenshot
        <input name="screenshot" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" required className="mt-2 block w-full cursor-pointer rounded-xl border border-charcoal-900/10 bg-white text-sm text-muted file:mr-4 file:border-0 file:bg-brand-600 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700" />
      </label>
      <label className="mt-4 block text-sm font-semibold text-charcoal-900">
        Optional note
        <textarea name="note" className="mt-2 min-h-20 w-full rounded-2xl border border-charcoal-900/10 bg-white px-4 py-3 text-sm" />
      </label>
      <button disabled={status === "loading"} className="mt-5 w-full rounded-full border border-brand-600 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-70">
        {status === "loading" ? "Uploading..." : "Upload screenshot"}
      </button>
      <p aria-live="polite" className={`mt-3 min-h-5 text-sm font-medium ${status === "success" ? "text-green-700" : "text-brand-700"}`}>{message}</p>
    </form>
  );
}
