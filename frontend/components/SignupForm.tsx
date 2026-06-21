"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { serviceOptions } from "@/data/services";
import { signup } from "@/lib/api";
import { buildAuthRedirectUrl, getPostAuthRedirect } from "@/lib/authRedirect";

const inputClass =
  "mt-2 w-full rounded-2xl border border-charcoal-900/10 bg-white px-4 py-3 text-sm text-charcoal-900 shadow-sm transition placeholder:text-muted/70 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const startDefaultService = pathname === "/start" ? "salary-itr-filing" : "";
  const selectedService = searchParams.get("service") || startDefaultService;
  const selectedServiceLabel = serviceOptions.find((option) => option.value === selectedService)?.label;
  const intent = searchParams.get("intent") || (selectedService ? "service_request" : "dashboard");
  const returnTo = searchParams.get("returnTo") || (selectedService ? `/request-service?service=${selectedService}` : "/dashboard");
  const loginHref = buildAuthRedirectUrl({ mode: "login", intent, returnTo, serviceSlug: selectedService || undefined, requestId: searchParams.get("requestId") || undefined });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    const result = await signup({
      fullName: String(formData.get("fullName") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      password,
      confirm_password: confirmPassword,
      consent: formData.get("consent") === "on",
      service: selectedService,
      intent,
      returnTo
    });

    if (result.ok) {
      router.push(getPostAuthRedirect(searchParams));
      return;
    }

    setStatus("error");
    setMessage(result.message || "Signup failed. Please try again.");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-charcoal-900/10 bg-white p-5 shadow-soft md:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Create account</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal-900">Create your account to continue.</h1>
      <p className="mt-3 text-sm leading-6 text-muted">Create your account to securely upload documents and track your request. No OTP.</p>
      {selectedServiceLabel ? (
        <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm font-semibold text-brand-800">
          You selected: {selectedServiceLabel}. Create your account and we will continue from here.
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        <label className="text-sm font-semibold text-charcoal-900">
          Full name
          <input name="fullName" className={inputClass} required autoComplete="name" />
        </label>
        <label className="text-sm font-semibold text-charcoal-900">
          Phone number
          <input name="phone" className={inputClass} required inputMode="tel" autoComplete="tel" />
        </label>
        <label className="text-sm font-semibold text-charcoal-900">
          Email
          <input name="email" className={inputClass} required type="email" autoComplete="email" />
        </label>
        <label className="text-sm font-semibold text-charcoal-900">
          Password
          <input name="password" className={inputClass} required type="password" autoComplete="new-password" />
        </label>
        <label className="text-sm font-semibold text-charcoal-900">
          Confirm password
          <input name="confirmPassword" className={inputClass} required type="password" autoComplete="new-password" />
        </label>
      </div>

      <label className="mt-5 flex gap-3 text-sm leading-6 text-muted">
        <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 rounded border-charcoal-900/20 text-brand-600" />
        <span>I agree to be contacted for this request and understand that final fee depends on documents and complexity.</span>
      </label>

      <button disabled={status === "loading"} className="mt-6 w-full rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-red transition hover:bg-brand-700 disabled:opacity-70">
        {status === "loading" ? "Creating..." : "Create account"}
      </button>
      <p aria-live="polite" className="mt-4 min-h-6 text-sm font-medium text-brand-700">{message}</p>
      <p className="mt-3 text-sm text-muted">
        Already have an account?{" "}
        <Link href={loginHref} className="font-semibold text-brand-700">
          Login to continue
        </Link>
      </p>
    </form>
  );
}
