import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Login",
  description: "Login with phone, email or Tax Help ID to track requests.",
  path: "/login",
  noIndex: true
});

export default function LoginPage() {
  return (
    <section className="container-shell grid gap-8 pb-16 pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Track status</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">Login to your dashboard.</h1>
        <p className="mt-5 text-lg leading-8 text-muted">Use phone, email or Tax Help ID. Forgot password? Use WhatsApp support.</p>
      </div>
      <LoginForm />
    </section>
  );
}
