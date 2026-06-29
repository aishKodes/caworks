import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/data/site.config";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getSiteSettingsContent } from "@/lib/content";

export async function ContactSection() {
  const settings = await getSiteSettingsContent();
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-3xl border border-charcoal-900/10 bg-white p-6 shadow-soft md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Contact</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal-900">Need help with tax, a claim or paperwork?</h2>
        <p className="mt-4 text-sm leading-7 text-muted">Enter your phone number, start a request, or use WhatsApp. We will contact you with simple next steps.</p>
        <div className="mt-6 grid gap-4 text-sm leading-7 text-charcoal-700 sm:grid-cols-2">
          <div>
            <p className="font-semibold text-charcoal-900">Phone</p>
            <Link href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="hover:text-brand-700">{settings.phone}</Link>
          </div>
          {settings.public_email ? (
            <div>
              <p className="font-semibold text-charcoal-900">Email</p>
              <Link href={`mailto:${settings.public_email}`} className="hover:text-brand-700">{settings.public_email}</Link>
            </div>
          ) : null}
          <div>
            <p className="font-semibold text-charcoal-900">Website</p>
            <Link href={siteConfig.siteUrl} className="hover:text-brand-700">www.vbcbharat.com</Link>
          </div>
          {settings.address ? (
            <div>
              <p className="font-semibold text-charcoal-900">Address</p>
              <p>{settings.address}</p>
            </div>
          ) : null}
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/request-service?service=not-sure" className="inline-flex justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-red transition hover:bg-brand-700">Get Help Now</Link>
          <WhatsAppButton />
        </div>
        {settings.google_business_profile_url || settings.google_maps_url || settings.google_review_url ? (
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            {settings.google_business_profile_url ? <a href={settings.google_business_profile_url} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:text-brand-800">View Google Profile</a> : null}
            {settings.google_maps_url ? <a href={settings.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:text-brand-800">Find Us on Google Maps</a> : null}
            {settings.google_review_url ? <a href={settings.google_review_url} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:text-brand-800">Read Reviews</a> : null}
          </div>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-3xl border border-charcoal-900/10 bg-white shadow-soft">
        <Image src={siteConfig.images.gstConsultation} alt="Business paperwork support consultation" width={900} height={650} priority className="aspect-[4/3] h-auto w-full object-cover object-center" />
      </div>
    </div>
  );
}
