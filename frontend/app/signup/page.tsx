import type { Metadata } from "next";
import { SignupForm } from "@/components/SignupForm";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Signup",
  description: "Create an account to upload documents, pay and track requests.",
  path: "/signup",
  noIndex: true
});

export default function SignupPage() {
  return (
    <section className="container-shell grid gap-8 pb-16 pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Create account</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">Get your Tax Help ID.</h1>
        <p className="mt-5 text-lg leading-8 text-muted">No OTP. Use your name, phone and a simple password or PIN. Email is optional.</p>
      </div>
      <SignupForm />
    </section>
  );
}
