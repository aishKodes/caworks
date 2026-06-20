"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getWhatsAppUrl, whatsappMessages } from "@/data/site.config";
import { login } from "@/lib/api";

const inputClass =
  "mt-2 w-full rounded-2xl border border-charcoal-900/10 bg-white px-4 py-3 text-sm text-charcoal-900 shadow-sm transition placeholder:text-muted/70 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10";

export function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const passwordHelpUrl = getWhatsAppUrl(`${whatsappMessages.support} I need help resetting my password.`);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setStatus("loading");
    const result = await login({
      identifier: String(formData.get("identifier") || ""),
      password: String(formData.get("password") || "")
    });

    if (result.ok) {
      router.push("/dashboard");
      return;
    }

    setStatus("error");
    setMessage(result.message || "Login failed. Please check your details.");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-charcoal-900/10 bg-white p-5 shadow-soft md:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Login</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal-900">Track your request.</h1>
      <p className="mt-3 text-sm leading-6 text-muted">Use phone, email or Tax Help ID with your password.</p>

      <div className="mt-6 grid gap-4">
        <label className="text-sm font-semibold text-charcoal-900">
          Phone / email / Tax Help ID
          <input name="identifier" className={inputClass} required autoComplete="username" />
        </label>
        <label className="text-sm font-semibold text-charcoal-900">
          Password
          <input name="password" className={inputClass} required type="password" autoComplete="current-password" />
        </label>
      </div>

      <button disabled={status === "loading"} className="mt-6 w-full rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-red transition hover:bg-brand-700 disabled:opacity-70">
        {status === "loading" ? "Checking..." : "Login"}
      </button>
      <p aria-live="polite" className="mt-4 min-h-6 text-sm font-medium text-brand-700">{message}</p>
      <div className="mt-5 flex flex-col gap-2 text-sm text-muted">
        <Link href="/signup" className="font-semibold text-brand-700">Create a new account</Link>
        <Link href={passwordHelpUrl || "/contact"} target={passwordHelpUrl ? "_blank" : undefined} rel={passwordHelpUrl ? "noopener noreferrer" : undefined} className="font-semibold text-charcoal-900">
          Forgot password? Contact support on WhatsApp
        </Link>
      </div>
    </form>
  );
}
