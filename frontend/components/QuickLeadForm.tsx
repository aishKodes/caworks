"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { serviceOptions } from "@/data/services";
import { submitQuickLead } from "@/lib/api";
import { cn } from "@/lib/utils";

const inputClass =
  "mt-2 w-full rounded-2xl border border-charcoal-900/10 bg-white px-4 py-3.5 text-base text-charcoal-900 shadow-sm transition placeholder:text-muted/70 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10";
const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

export function QuickLeadForm({ sourcePage = "homepage", compact = false }: { sourcePage?: string; compact?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    utmKeys.forEach((key) => {
      const input = formRef.current?.elements.namedItem(key);
      const value = params.get(key);
      if (input instanceof HTMLInputElement && value) {
        input.value = value;
      }
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const phone = String(formData.get("phone") || "").trim();

    if (!/^[0-9+\s-]{8,16}$/.test(phone)) {
      setStatus("error");
      setMessage("Please enter a valid phone number.");
      return;
    }

    setStatus("loading");
    const utm = utmKeys.reduce<Record<string, string>>((result, key) => {
      const value = String(formData.get(key) || "");
      if (value) result[key] = value;
      return result;
    }, {});

    const result = await submitQuickLead({
      name: String(formData.get("name") || ""),
      phone,
      service: String(formData.get("service") || ""),
      message: String(formData.get("message") || ""),
      sourcePage,
      honeypot: String(formData.get("website") || ""),
      utm
    });

    if (result.ok) {
      form.reset();
      setStatus("success");
      setMessage("Thank you. Our team will contact you on phone or WhatsApp.");
    } else {
      setStatus("error");
      setMessage(result.message || "Something went wrong. Please try again or use WhatsApp.");
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn(
        "rounded-3xl border border-charcoal-900/10 bg-white p-5 shadow-soft md:p-6",
        compact && "shadow-premium lg:min-w-[320px]"
      )}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Quick help</p>
        <h2 className={cn("mt-2 font-semibold tracking-tight text-charcoal-900", compact ? "text-xl" : "text-2xl")}>Enter phone number</h2>
        <p className="mt-2 text-sm leading-6 text-charcoal-700">No signup needed. We will call or message you.</p>
      </div>

      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {utmKeys.map((key) => (
        <input key={key} type="hidden" name={key} defaultValue="" />
      ))}

      <div className={cn("mt-5 grid gap-4", compact && "gap-3")}>
        <label className="text-sm font-semibold text-charcoal-900">
          Phone number
          <input name="phone" required className={cn(inputClass, compact && "py-4 text-lg")} placeholder="+91..." inputMode="tel" autoComplete="tel" />
        </label>
        {compact ? (
          <>
            <label className="text-sm font-semibold text-charcoal-900">
              Name optional
              <input name="name" className={inputClass} placeholder="Your name" autoComplete="name" />
            </label>
            <input type="hidden" name="service" value="salary-itr-filing" />
            <input type="hidden" name="message" value="Homepage call back request" />
          </>
        ) : (
          <>
            <label className="text-sm font-semibold text-charcoal-900">
              Name optional
              <input name="name" className={inputClass} placeholder="Your name" autoComplete="name" />
            </label>
            <label className="text-sm font-semibold text-charcoal-900">
              Service optional
              <select name="service" className={inputClass} defaultValue="salary-itr-filing">
                {serviceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-charcoal-900">
              Message optional
              <textarea name="message" className={`${inputClass} min-h-24 resize-y`} placeholder="Tell us what help you need" />
            </label>
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 inline-flex w-full justify-center rounded-full bg-brand-600 px-6 py-4 text-base font-semibold text-white shadow-red transition hover:bg-brand-700 disabled:opacity-70"
      >
        {status === "loading" ? "Sending..." : compact ? "Call Me Back" : "Request Call Back"}
      </button>

      <p className="mt-3 text-xs leading-5 text-muted">Your phone number is used only to contact you for this request.</p>
      <p aria-live="polite" className={`mt-3 min-h-6 text-sm font-medium ${status === "success" ? "text-green-700" : "text-brand-700"}`}>
        {message}
      </p>
    </form>
  );
}
