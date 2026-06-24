"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { serviceOptions } from "@/data/services";
import { getWhatsAppUrl, whatsappMessages } from "@/data/site.config";
import { createServiceRequest, submitGuestRequest, type GuestRequestResult } from "@/lib/api";
import { buildAuthRedirectUrl } from "@/lib/authRedirect";
import { useAuth } from "@/components/AuthProvider";

const inputClass =
  "mt-2 w-full rounded-2xl border border-charcoal-900/10 bg-white px-4 py-3.5 text-base text-charcoal-900 shadow-sm transition placeholder:text-muted/70 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10";

export function GuestRequestForm({
  defaultService = "salary-itr-filing",
  intent = "service_request",
  variant = "default",
  options = serviceOptions
}: {
  defaultService?: string;
  intent?: "service_request" | "upload_documents";
  variant?: "default" | "hero";
  options?: ReadonlyArray<{ value: string; label: string }>;
}) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<GuestRequestResult | null>(null);
  const loginHref = buildAuthRedirectUrl({
    mode: "login",
    intent,
    returnTo: `/request-service?service=${encodeURIComponent(defaultService)}`,
    serviceSlug: defaultService
  });
  const signupHref = buildAuthRedirectUrl({
    mode: "signup",
    intent,
    returnTo: `/request-service?service=${encodeURIComponent(defaultService)}`,
    serviceSlug: defaultService
  });
  const whatsappUrl = getWhatsAppUrl(whatsappMessages.homepage);
  const isHero = variant === "hero";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setStatus("loading");
    setMessage("");
    const selectedService = String(formData.get("service") || defaultService);
    const details = String(formData.get("message") || "");
    const response = isAuthenticated
      ? await createServiceRequest({ serviceType: selectedService, details })
      : await submitGuestRequest({
          name: String(formData.get("name") || ""),
          phone: String(formData.get("phone") || ""),
          email: String(formData.get("email") || ""),
          service_slug: selectedService,
          message: details,
          honeypot: String(formData.get("website") || "")
        });

    if (response.ok && response.data) {
      if ("request" in response.data) {
        const request = response.data.request;
        setResult({
          request_id: request.request_code,
          request_db_id: request.id,
          upload_token: "",
          upload_url: `/dashboard/upload?requestId=${request.id}&service=${encodeURIComponent(selectedService)}`,
          upload_path: `/dashboard/upload?requestId=${request.id}&service=${encodeURIComponent(selectedService)}`
        });
      } else {
        setResult(response.data);
      }
      setStatus("success");
      setMessage(response.message || "Thank you. Your request has been received. Our team will contact you on phone or WhatsApp.");
      return;
    }

    setStatus("error");
    setMessage(response.message || "Something went wrong. Please try again or use WhatsApp.");
  }

  if (status === "success" && result) {
    return (
      <div className="rounded-3xl border border-green-700/20 bg-white p-5 shadow-soft md:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">Request received</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-charcoal-900">Thank you. We will contact you shortly.</h2>
        <p className="mt-3 text-base leading-7 text-charcoal-700">{message}</p>
        <div className="mt-5 rounded-2xl bg-paper p-4">
          <p className="text-sm text-charcoal-700">Your Request ID</p>
          <p className="mt-1 text-xl font-bold text-charcoal-900">{result.request_id}</p>
        </div>
        <div className="mt-6 grid gap-3">
          <Link href={result.upload_path || result.upload_url} className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-red transition hover:bg-brand-700">
            Upload documents
          </Link>
          <Link href={whatsappUrl || "/contact"} target={whatsappUrl ? "_blank" : undefined} rel={whatsappUrl ? "noopener noreferrer" : undefined} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#128c4a] px-6 py-3 text-base font-semibold text-white">
            Talk on WhatsApp
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`rounded-3xl border border-charcoal-900/10 bg-white p-5 shadow-soft ${isHero ? "md:p-6" : "md:p-7"}`}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{isAuthenticated ? "Your account" : isHero ? "Get practical help" : "Continue without account"}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-charcoal-900">{isAuthenticated ? `Start a request as ${user?.full_name}.` : isHero ? "Tell us what you need." : "Start with your phone number."}</h2>
      <p className="mt-3 text-base leading-7 text-charcoal-700">
        {isAuthenticated ? "This request and its documents will be saved to your dashboard." : isHero ? "No login needed. Send your issue and our team will call or message you." : "No password is needed. We will create your request and give you a secure document upload link."}
      </p>

      <div className="mt-6 grid gap-4">
        <label className="text-sm font-semibold text-charcoal-900">
          Name
          <input key={`name-${user?.id || "guest"}`} name="name" className={inputClass} required autoComplete="name" defaultValue={user?.full_name || ""} />
        </label>
        <label className="text-sm font-semibold text-charcoal-900">
          Phone number
          <input key={`phone-${user?.id || "guest"}`} name="phone" className={inputClass} required inputMode="tel" autoComplete="tel" placeholder="+91..." defaultValue={user?.phone || ""} />
        </label>
        <label className="text-sm font-semibold text-charcoal-900">
          Service
          <select name="service" className={inputClass} defaultValue={defaultService}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        {isHero ? <input name="email" type="hidden" value="" /> : (
          <label className="text-sm font-semibold text-charcoal-900">
            Email <span className="font-medium text-muted">(optional)</span>
            <input key={`email-${user?.id || "guest"}`} name="email" className={inputClass} type="email" autoComplete="email" defaultValue={user?.email || ""} />
          </label>
        )}
        <label className="text-sm font-semibold text-charcoal-900">
          Short message <span className="font-medium text-muted">(optional)</span>
          <textarea name="message" className={`${inputClass} min-h-24 resize-y`} placeholder="Tell us what help you need" />
        </label>
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      </div>

      <button disabled={status === "loading" || authLoading} className="mt-6 min-h-12 w-full rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-red transition hover:bg-brand-700 disabled:opacity-70">
        {status === "loading" || authLoading ? "Please wait..." : isHero ? "Get Help" : intent === "upload_documents" ? "Continue to upload" : "Start request"}
      </button>
      <p aria-live="polite" className="mt-4 min-h-6 text-sm font-medium text-brand-700">{message}</p>

      {!isHero && !isAuthenticated ? (
        <div className="mt-5 border-t border-charcoal-900/10 pt-5">
          <p className="text-sm text-charcoal-700">Want online tracking?</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href={loginHref} className="text-brand-700 hover:text-brand-800">Login</Link>
            <Link href={signupHref} className="text-charcoal-900 hover:text-brand-700">Create account</Link>
          </div>
        </div>
      ) : null}
    </form>
  );
}
