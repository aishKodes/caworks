import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/data/site.config";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function ContactSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-3xl border border-charcoal-900/10 bg-white p-6 shadow-soft md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Contact</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal-900">Need help with tax or paperwork?</h2>
        <p className="mt-4 text-sm leading-7 text-muted">Enter your phone number, start a request, or use WhatsApp. We will contact you with simple next steps.</p>
        <div className="mt-6 grid gap-4 text-sm leading-7 text-charcoal-700 sm:grid-cols-2">
          <div>
            <p className="font-semibold text-charcoal-900">Phone</p>
            <p>{siteConfig.phone}</p>
          </div>
          <div>
            <p className="font-semibold text-charcoal-900">Email</p>
            <Link href={`mailto:${siteConfig.email}`} className="hover:text-brand-700">{siteConfig.email}</Link>
          </div>
          <div className="sm:col-span-2">
            <p className="font-semibold text-charcoal-900">Address</p>
            <p>{siteConfig.address}</p>
          </div>
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/quick-contact" className="inline-flex justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-red transition hover:bg-brand-700">Enter Phone Number</Link>
          <WhatsAppButton />
        </div>
      </div>
      <div className="overflow-hidden rounded-3xl border border-charcoal-900/10 bg-white shadow-soft">
        <Image src={siteConfig.images.gstConsultation} alt="Business paperwork support consultation" width={900} height={650} priority className="h-full min-h-[320px] w-full object-cover" />
      </div>
    </div>
  );
}
