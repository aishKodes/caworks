"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { siteConfig } from "@/data/site.config";
import { services, type Service } from "@/data/services";
import type { MenuServiceContent } from "@/lib/content";
import { cn } from "@/lib/utils";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useAuth } from "@/components/AuthProvider";

const links = [
  { href: "/", label: "Home" },
  { href: "/salary-itr-filing", label: "ITR Filing" },
  { href: "/gst-services", label: "GST" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" }
];

const menuGroups = [
  {
    title: "Individuals",
    slugs: ["salary-itr-filing", "itr-1-filing", "itr-2-capital-gains-filing", "freelancer-business-itr", "tax-notice-help", "upload-documents", "track-status"]
  },
  {
    title: "Business",
    slugs: ["gst-registration", "gst-return-filing", "bookkeeping", "tds-return-filing", "payroll-compliance", "business-registration", "company-llp-compliance", "msme-udyam-registration", "loan-project-report", "subsidy-scheme-guidance"]
  },
  {
    title: "Insurance Claims",
    slugs: ["insurance-claim-support", "insurance-claim-rejected", "health-insurance-claim-help", "cashless-claim-denied", "mediclaim-reimbursement-help", "motor-insurance-claim-support", "life-insurance-claim-assistance", "personal-accident-insurance-claim", "claim-form-preparation-support", "insurance-claim-follow-up", "settlement-documentation-assistance", "nominee-claim-assistance"]
  },
  {
    title: "More support",
    slugs: ["business-loan-paperwork", "digital-signature-certificate-support", "pan-tan-assistance", "accounting-cleanup-support", "annual-compliance-support", "professional-tax-labour-compliance", "import-export-documentation-help", "general-tax-support"]
  }
] as const;

type HeaderServiceItem = Service | { slug: string; label: string; heroText: string; category?: string };

function serviceBySlug(slug: string): HeaderServiceItem | null {
  if (slug === "upload-documents") return { slug, label: "Document Upload", heroText: "Upload files or send documents from your phone." };
  if (slug === "track-status") return { slug, label: "Track Status", heroText: "Check request, payment and document status." };
  return services.find((service) => service.slug === slug) || null;
}

function categoryTitle(category?: string) {
  const value = (category || "").toLowerCase();
  if (value.includes("insurance")) return "Insurance Claims";
  if (value.includes("individual") || value === "itr" || value === "support") return "Individuals";
  if (value.includes("loan") || value.includes("subsidy")) return "Loans & Subsidy";
  return "Business";
}

function groupCmsServices(items: MenuServiceContent[]) {
  const grouped = new Map<string, HeaderServiceItem[]>();
  for (const item of items) {
    const title = categoryTitle(item.category);
    grouped.set(title, [...(grouped.get(title) || []), item]);
  }
  grouped.set("Individuals", [
    ...(grouped.get("Individuals") || []),
    { slug: "upload-documents", label: "Document Upload", heroText: "Upload files or send documents from your phone." },
    { slug: "track-status", label: "Track Status", heroText: "Check request, payment and document status." }
  ]);
  const insuranceMenuSlugs = new Set(["insurance-claim-support", "insurance-claim-rejected", "health-insurance-claim-help", "cashless-claim-denied", "mediclaim-reimbursement-help", "motor-insurance-claim-support", "life-insurance-claim-assistance", "personal-accident-insurance-claim", "claim-form-preparation-support", "insurance-claim-follow-up", "settlement-documentation-assistance", "nominee-claim-assistance"]);
  const insuranceItems = services.filter((service) => insuranceMenuSlugs.has(service.slug));
  const currentInsuranceSlugs = new Set((grouped.get("Insurance Claims") || []).map((service) => service.slug));
  grouped.set("Insurance Claims", [
    ...(grouped.get("Insurance Claims") || []),
    ...insuranceItems.filter((service) => !currentInsuranceSlugs.has(service.slug))
  ]);
  return Array.from(grouped.entries()).map(([title, groupedItems]) => ({ title, items: groupedItems }));
}

export function Header({ menuServices = [] }: { menuServices?: MenuServiceContent[] }) {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const servicesMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, status, isAuthenticated, logout } = useAuth();
  const firstName = user?.full_name?.trim().split(/\s+/)[0] || "Account";
  const groupedServices = useMemo(() => {
    if (menuServices.length) return groupCmsServices(menuServices);
    return menuGroups.map((group) => ({ ...group, items: group.slugs.map(serviceBySlug).filter(Boolean) as HeaderServiceItem[] }));
  }, [menuServices]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setServicesOpen(false);
        setOpen(false);
        setMobileServicesOpen(false);
      }
    }

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (servicesMenuRef.current && !servicesMenuRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  async function handleLogout() {
    await logout();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-charcoal-900/10 bg-paper/90 backdrop-blur-xl">
      <div className="container-shell flex min-h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" aria-label={`${siteConfig.name} home`}>
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-charcoal-900/10">
            <Image src={siteConfig.images.logoMark} alt="" fill priority sizes="44px" className="object-contain" />
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
          <div ref={servicesMenuRef} className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
            <button
              type="button"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold text-charcoal-900 transition hover:bg-white hover:shadow-soft",
                servicesOpen && "bg-white shadow-soft"
              )}
              aria-haspopup="menu"
              aria-expanded={servicesOpen}
              onClick={() => setServicesOpen((value) => !value)}
            >
              Services <span aria-hidden="true" className="ml-1 text-xs">⌄</span>
            </button>
            {servicesOpen ? (
              <div
                className="absolute left-1/2 top-full w-[960px] max-w-[calc(100vw-2rem)] -translate-x-1/2 translate-y-2 rounded-3xl border border-charcoal-900/10 bg-white p-5 opacity-100 shadow-premium transition"
                role="menu"
              >
                <div className="grid gap-5 lg:grid-cols-4">
                  {groupedServices.map((group) => (
                    <div key={group.title}>
                      <p className="px-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{group.title}</p>
                      <div className="mt-2 grid gap-1">
                        {group.items.map((service) => (
                          <Link key={service.slug} href={`/${service.slug}`} role="menuitem" onClick={() => setServicesOpen(false)} className="rounded-2xl p-3 transition hover:bg-brand-50 focus:bg-brand-50">
                            <span className="block text-sm font-semibold text-charcoal-900">{service.label}</span>
                            <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted">{service.heroText}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
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

        <div className="hidden items-center gap-2 lg:flex">
          {status === "loading" || status === "unknown" ? (
            <span className="h-10 w-28 animate-pulse rounded-full bg-charcoal-900/5" aria-label="Checking login" />
          ) : isAuthenticated ? (
            <>
              <Link href="/dashboard" className="rounded-full bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700">
                {firstName} · Dashboard
              </Link>
              <Link href="/dashboard/requests" className="rounded-full px-3 py-2.5 text-sm font-semibold text-charcoal-900 hover:bg-white">My Requests</Link>
              <Link href="/dashboard/upload" className="rounded-full px-3 py-2.5 text-sm font-semibold text-charcoal-900 hover:bg-white">Upload</Link>
              <button type="button" onClick={handleLogout} className="rounded-full border border-charcoal-900/10 px-3 py-2.5 text-sm font-semibold text-charcoal-900 hover:border-brand-600 hover:text-brand-700">Logout</button>
            </>
          ) : (
            <>
              <WhatsAppButton className="px-4 py-2.5" />
              <Link href="/login" className="rounded-full border border-charcoal-900/10 px-4 py-2.5 text-sm font-semibold text-charcoal-900 transition hover:border-brand-600 hover:text-brand-700">Login</Link>
              <Link href="/upload-documents" className="rounded-full px-3 py-2.5 text-sm font-semibold text-charcoal-900 hover:bg-white">Upload</Link>
              <Link href="/request-service?service=not-sure" className="rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-red transition hover:bg-brand-700">Get Help Now</Link>
            </>
          )}
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
          <div className="container-shell max-h-[calc(100vh-72px)] overflow-y-auto py-4">
            <div className="grid gap-2">
              {[...links, { href: "/upload-documents", label: "Upload Docs" }, { href: "/track-status", label: "Track Status" }].map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-semibold text-charcoal-900 hover:bg-brand-50">
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <div className="rounded-2xl bg-brand-50 px-4 py-3">
                    <p className="font-semibold text-brand-800">{user?.full_name}</p>
                    <p className="mt-1 text-xs text-brand-700">{user?.tax_help_id}</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-semibold text-charcoal-900 hover:bg-brand-50">Dashboard</Link>
                  <Link href="/dashboard/requests" onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-semibold text-charcoal-900 hover:bg-brand-50">My Requests</Link>
                  <Link href="/dashboard/upload" onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-semibold text-charcoal-900 hover:bg-brand-50">Upload Documents</Link>
                  <button type="button" onClick={handleLogout} className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-brand-700 hover:bg-brand-50">Logout</button>
                </>
              ) : status === "guest" ? (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-semibold text-charcoal-900 hover:bg-brand-50">Login</Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-semibold text-charcoal-900 hover:bg-brand-50">Create Account</Link>
                  <Link href="/request-service?service=not-sure" onClick={() => setOpen(false)} className="rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white">Start Request</Link>
                </>
              ) : (
                <div className="h-12 animate-pulse rounded-2xl bg-charcoal-900/5" aria-label="Checking login" />
              )}
            </div>
            <button
              type="button"
              className="mt-4 flex w-full items-center justify-between rounded-2xl bg-paper px-4 py-3 text-left text-sm font-semibold text-charcoal-900"
              aria-expanded={mobileServicesOpen}
              onClick={() => setMobileServicesOpen((value) => !value)}
            >
              Services <span aria-hidden="true">{mobileServicesOpen ? "−" : "+"}</span>
            </button>
            {mobileServicesOpen ? (
              <div className="mt-3 space-y-4 rounded-2xl bg-paper p-3">
                {groupedServices.map((group) => (
                  <div key={group.title}>
                    <p className="px-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{group.title}</p>
                    <div className="mt-2 grid gap-1 sm:grid-cols-2">
                      {group.items.map((service) => (
                        <Link key={service.slug} href={`/${service.slug}`} onClick={() => setOpen(false)} className="rounded-xl bg-white/70 px-3 py-3 text-sm font-medium text-charcoal-900 hover:bg-white">
                          {service.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <WhatsAppButton className="mt-4 w-full" variant="solid" />
          </div>
        </div>
      ) : null}
    </header>
  );
}
