"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/data/site.config";
import { services } from "@/data/services";
import { cn } from "@/lib/utils";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const links = [
  { href: "/", label: "Home" },
  { href: "/salary-itr-filing", label: "ITR Filing" },
  { href: "/gst-services", label: "GST" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" }
];

const menuServices = services.slice(0, 12);

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-charcoal-900/10 bg-paper/90 backdrop-blur-xl">
      <div className="container-shell flex min-h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" aria-label={`${siteConfig.name} home`}>
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-charcoal-900/10">
            <Image src={siteConfig.images.logoMark} alt="" fill priority sizes="44px" className="object-contain p-1.5" />
          </span>
          <span>
            <span className="block text-lg font-semibold tracking-tight text-charcoal-900">{siteConfig.name}</span>
            <span className="hidden text-xs font-medium text-muted sm:block">{siteConfig.tagline}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {links.slice(0, 3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white hover:shadow-soft",
                pathname === link.href ? "text-brand-700" : "text-charcoal-900"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="group relative">
            <button type="button" className="rounded-full px-4 py-2 text-sm font-semibold text-charcoal-900 transition hover:bg-white hover:shadow-soft">
              Services
            </button>
            <div className="invisible absolute left-0 top-full w-[660px] translate-y-3 rounded-3xl border border-charcoal-900/10 bg-white p-4 opacity-0 shadow-premium transition group-hover:visible group-hover:translate-y-2 group-hover:opacity-100">
              <div className="grid grid-cols-3 gap-2">
                {menuServices.map((service) => (
                  <Link key={service.slug} href={`/${service.slug}`} className="rounded-2xl p-3 transition hover:bg-brand-50">
                    <span className="block text-sm font-semibold text-charcoal-900">{service.label}</span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted">{service.heroText}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {links.slice(3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white hover:shadow-soft",
                pathname === link.href ? "text-brand-700" : "text-charcoal-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <WhatsAppButton className="px-4 py-2.5" />
          <Link href="/login" className="rounded-full border border-charcoal-900/10 px-4 py-2.5 text-sm font-semibold text-charcoal-900 transition hover:border-brand-600 hover:text-brand-700">
            Login
          </Link>
          <Link href="/start" className="rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-red transition hover:bg-brand-700">
            Start ITR Filing
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-charcoal-900/10 bg-white text-charcoal-900 shadow-soft lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="text-2xl leading-none">{open ? "×" : "≡"}</span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-charcoal-900/10 bg-white lg:hidden">
          <div className="container-shell py-4">
            <div className="grid gap-2">
              {[...links, { href: "/upload-documents", label: "Upload Docs" }, { href: "/track-status", label: "Track Status" }, { href: "/login", label: "Login" }, { href: "/signup", label: "Signup" }].map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-semibold text-charcoal-900 hover:bg-brand-50">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 grid gap-1 rounded-2xl bg-paper p-3 sm:grid-cols-2">
              {menuServices.slice(0, 10).map((service) => (
                <Link key={service.slug} href={`/${service.slug}`} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-charcoal-900 hover:bg-white">
                  {service.label}
                </Link>
              ))}
            </div>
            <WhatsAppButton className="mt-4 w-full" variant="solid" />
          </div>
        </div>
      ) : null}
    </header>
  );
}
