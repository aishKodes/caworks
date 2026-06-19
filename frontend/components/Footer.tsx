import Link from "next/link";
import { siteConfig } from "@/data/site.config";
import { services } from "@/data/services";
import { WhatsAppButton } from "@/components/WhatsAppButton";

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

export function Footer() {
  return (
    <footer className="border-t border-charcoal-900/10 bg-charcoal-900 pb-20 text-white md:pb-0">
      <div className="container-shell py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-bold text-charcoal-900">VB</span>
              <span>
                <span className="block text-lg font-semibold tracking-tight">{siteConfig.name}</span>
                <span className="text-xs font-medium text-white/60">{siteConfig.tagline}</span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
              Online support for ITR filing, GST, loan paperwork, bookkeeping, notices and business compliance, built for clear mobile steps.
            </p>
            <div className="mt-6 space-y-2 text-sm text-white/70">
              <p>{siteConfig.address}</p>
              <p>{siteConfig.phone} · {siteConfig.email}</p>
            </div>
            <div className="mt-6">
              <WhatsAppButton variant="light" />
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">Services</h2>
              <ul className="mt-4 space-y-3">
                {services.slice(0, 12).map((service) => (
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
          © {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
