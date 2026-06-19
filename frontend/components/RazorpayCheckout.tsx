"use client";

import { useState } from "react";
import { siteConfig } from "@/data/site.config";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/api";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function RazorpayCheckout({ requestId, amount }: { requestId: string; amount: number }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function pay() {
    if (!siteConfig.razorpayKeyId) {
      setMessage("Online payment is not configured. Please use manual payment or WhatsApp.");
      return;
    }

    setLoading(true);
    const order = await createRazorpayOrder(requestId, amount);
    setLoading(false);

    if (!order.ok || !order.data) {
      setMessage(order.message || "Could not start online payment.");
      return;
    }

    if (!window.Razorpay) {
      setMessage("Razorpay script is not loaded. Please refresh or use manual payment.");
      return;
    }

    const checkout = new window.Razorpay({
      key: siteConfig.razorpayKeyId,
      amount: order.data.amount,
      currency: order.data.currency,
      order_id: order.data.order_id,
      name: siteConfig.name,
      description: "Service payment",
      handler: async (response: Record<string, string>) => {
        const result = await verifyRazorpayPayment({
          ...response,
          request_id: requestId
        });
        setMessage(result.ok ? "Payment received. Your status will update shortly." : result.message || "Payment verification failed.");
      }
    });

    checkout.open();
  }

  return (
    <div className="rounded-2xl border border-charcoal-900/10 bg-white p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-charcoal-900">Pay securely online</h3>
      <p className="mt-2 text-sm leading-6 text-muted">Razorpay supports UPI, cards, netbanking and wallets.</p>
      <button onClick={pay} disabled={loading} className="mt-5 w-full rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-red transition hover:bg-brand-700 disabled:opacity-70">
        {loading ? "Starting..." : "Pay Securely Online"}
      </button>
      <p aria-live="polite" className="mt-3 min-h-5 text-sm font-medium text-brand-700">{message}</p>
    </div>
  );
}
