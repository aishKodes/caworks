import Link from "next/link";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { cn } from "@/lib/utils";

export function CTASection({
  title = "Need help today?",
  description = "Start ITR filing, upload documents, or enter your phone number. We will guide you in simple steps.",
  className
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <section className={cn("container-shell", className)}>
      <div className="min-w-0 overflow-hidden rounded-3xl bg-charcoal-900 p-6 text-white shadow-premium md:p-10">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-100">Simple next step</p>
            <h2 className="mt-3 break-words text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
            <p className="mt-4 max-w-2xl break-words text-base leading-7 text-white/75">{description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <Link href="/start" className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-charcoal-900 transition hover:bg-brand-50">Start ITR Filing</Link>
            <Link href="/quick-contact" className="inline-flex justify-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Enter Phone Number</Link>
            <WhatsAppButton variant="light" />
          </div>
        </div>
      </div>
    </section>
  );
}
