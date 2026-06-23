"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { serviceOptions } from "@/data/services";
import { getWhatsAppUrl, whatsappMessages } from "@/data/site.config";
import { login } from "@/lib/api";
import { buildAuthRedirectUrl, getPostAuthRedirect } from "@/lib/authRedirect";

const inputClass =
  "mt-2 w-full rounded-2xl border border-charcoal-900/10 bg-white px-4 py-3 text-sm text-charcoal-900 shadow-sm transition placeholder:text-muted/70 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordHelpUrl = getWhatsAppUrl(`${whatsappMessages.support} I need help resetting my password.`);
  const selectedService = searchParams.get("service") || "";
  const selectedServiceLabel = serviceOptions.find((option) => option.value === selectedService)?.label;
  const intent = searchParams.get("intent") || "dashboard";
  const returnTo = searchParams.get("returnTo") || "/dashboard";
  const signupHref = buildAuthRedirectUrl({ mode: "signup", intent, returnTo, serviceSlug: selectedService || undefined, requestId: searchParams.get("requestId") || undefined });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setStatus("loading");
    const result = await login({
      identifier: String(formData.get("identifier") || ""),
      password: String(formData.get("password") || ""),
      remember: formData.get("remember") === "on"
    });

    if (result.ok) {
      router.push(getPostAuthRedirect(searchParams));
      return;
    }

    setStatus("error");
    setMessage(result.message || "Login failed. Please check your details.");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-charcoal-900/10 bg-white p-5 shadow-soft md:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Login</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal-900">Login to continue your request.</h1>
      <p className="mt-3 text-base leading-7 text-charcoal-700">Use phone, email or Tax Help ID with your password or PIN.</p>
      {selectedServiceLabel ? (
        <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm font-semibold text-brand-800">
          You selected: {selectedServiceLabel}. Login and we will continue from here.
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        <label className="text-sm font-semibold text-charcoal-900">
          Phone / email / Tax Help ID
          <input name="identifier" className={inputClass} required autoComplete="username" />
        </label>
        <label className="text-sm font-semibold text-charcoal-900">
          Password or PIN
          <span className="relative block">
            <input name="password" className={`${inputClass} pr-20`} required type={showPassword ? "text" : "password"} autoComplete="current-password" />
            <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 rounded-full px-3 py-2 text-xs font-semibold text-brand-700">
              {showPassword ? "Hide" : "Show"}
            </button>
          </span>
        </label>
      </div>

      <label className="mt-5 flex gap-3 text-sm leading-6 text-muted">
        <input name="remember" type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-charcoal-900/20 text-brand-600" />
        <span>Keep me logged in on this device.</span>
      </label>

      <button disabled={status === "loading"} className="mt-6 w-full rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-red transition hover:bg-brand-700 disabled:opacity-70">
        {status === "loading" ? "Checking..." : "Login"}
      </button>
      <p aria-live="polite" className="mt-4 min-h-6 text-sm font-medium text-brand-700">{message}</p>
      <div className="mt-5 flex flex-col gap-2 text-sm text-muted">
        <Link href={signupHref} className="font-semibold text-brand-700">Create a new account</Link>
        <Link href={passwordHelpUrl || "/contact"} target={passwordHelpUrl ? "_blank" : undefined} rel={passwordHelpUrl ? "noopener noreferrer" : undefined} className="font-semibold text-charcoal-900">
          Forgot password? Contact support on WhatsApp
        </Link>
      </div>
    </form>
  );
}
