import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/data/site.config";
import { services } from "@/data/services";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getSiteSettingsContent } from "@/lib/content";

const resourceLinks = [
  { href: "/blog", label: "Guides" },
  { href: "/pricing", label: "Pricing" },
  { href: "/quick-contact", label: "Quick contact" },
  { href: "/track-status", label: "Track status" },
  { href: "/upload-documents", label: "Upload documents" }
];

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
  { href: "/refund-policy", label: "Refund Policy" }
];

const footerServiceSlugs = [
  "insurance-claim-support",
  "insurance-claim-documentation-support",
  "insurance-claim-rejected",
  "health-insurance-claim-help",
  "life-insurance-claim-assistance",
  "motor-insurance-claim-support",
  "personal-accident-insurance-claim",
  "insurance-legal-escalation-support",
  "salary-itr-filing",
  "itr-1-filing",
  "itr-2-capital-gains-filing",
  "gst-registration",
  "gst-return-filing",
  "bookkeeping",
  "tds-return-filing",
  "payroll-compliance",
  "tax-notice-help",
  "business-registration",
  "msme-udyam-registration",
  "company-llp-compliance",
  "loan-project-report",
  "business-loan-paperwork",
  "subsidy-scheme-guidance",
  "digital-signature-certificate-support"
];

const footerServices = footerServiceSlugs
  .map((slug) => services.find((service) => service.slug === slug))
  .filter((service): service is NonNullable<typeof service> => Boolean(service));

export async function Footer() {
  const settings = await getSiteSettingsContent();
  return (
    <footer className="border-t border-charcoal-900/10 bg-charcoal-900 pb-20 text-white md:pb-0">
      <div className="container-shell py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white">
                <Image src={siteConfig.images.logoMark} alt="" fill sizes="44px" className="object-contain" />
              </span>
              <span>
                <span className="block text-lg font-semibold tracking-tight">{siteConfig.name}</span>
                <span className="text-xs font-medium text-white/60">{siteConfig.tagline}</span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
              {settings.footer_text}
            </p>
            <div className="mt-6 space-y-2 text-sm text-white/70">
              {settings.address ? <p>{settings.address}</p> : null}
              <p>{settings.phone}{settings.public_email ? ` · ${settings.public_email}` : ""}</p>
              <p>www.vbcbharat.com</p>
              <p className="text-xs text-white/45">Registered business name: {siteConfig.registeredBusinessName}</p>
            </div>
            <div className="mt-6">
              <WhatsAppButton variant="light" />
            </div>
            {settings.google_business_profile_url || settings.google_maps_url || settings.google_review_url ? (
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
                {settings.google_business_profile_url ? (
                  <a href={settings.google_business_profile_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-3 py-2 text-white/75 transition hover:text-white">
                    View Google Profile
                  </a>
                ) : null}
                {settings.google_maps_url ? (
                  <a href={settings.google_maps_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-3 py-2 text-white/75 transition hover:text-white">
                    Find Us on Google Maps
                  </a>
                ) : null}
                {settings.google_review_url ? (
                  <a href={settings.google_review_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-3 py-2 text-white/75 transition hover:text-white">
                    Review Us on Google
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">Services</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {footerServices.map((service) => (
                  <li key={service.slug}>
                    <Link href={`/${service.slug}`} className="text-sm text-white/70 transition hover:text-white">{service.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">Resources</h2>
              <ul className="mt-4 space-y-3">
                {resourceLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/70 transition hover:text-white">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">Legal</h2>
              <ul className="mt-4 space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/70 transition hover:text-white">{link.label}</Link>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-6 text-white/50">
                Disclaimer: Information is general. Final fee, tax, refund, filing position and eligibility depend on documents and official records.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/50">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
