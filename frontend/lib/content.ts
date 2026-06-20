import { homeFaqs, type FAQItem } from "@/data/faqs";
import { pricingPlans } from "@/data/pricing";
import { siteConfig } from "@/data/site.config";
import { testimonials } from "@/data/testimonials";

export type HomepageContent = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  finalCtaTitle?: string;
  finalCtaDescription?: string;
  trustBadges?: Array<{ title: string; text: string }>;
  faqs?: FAQItem[];
  testimonials?: typeof testimonials;
  sectionVisibility?: Record<string, boolean>;
};

export type PricingContent = Array<{
  name: string;
  price: string;
  description: string;
  features: readonly string[];
}>;

export type ServiceContentOverride = {
  slug: string;
  title?: string;
  subtitle?: string;
  heroImage?: string;
  pricingText?: string;
  faqs?: FAQItem[];
  seoTitle?: string;
  seoDescription?: string;
};

type ApiPayload<T> = {
  ok: boolean;
  data?: T;
};

function cleanPublicText(value: string | undefined, fallback: string) {
  return (value || fallback)
    .replaceAll("Tax, GST and business paperwork made simple for Indian families and businesses.", "Tax, GST and business paperwork made simple")
    .replaceAll("File ITR, get GST help, upload documents, pay securely and track your request — all from your phone.", "From ITR filing to GST, notices, loans and business paperwork — get simple support from your phone.")
    .replaceAll("Vedanath Business Consultants", siteConfig.name)
    .replaceAll("Veedanath Business Consultants", siteConfig.name)
    .replaceAll("CA-reviewed", "professionally checked")
    .replaceAll("guaranteed refund", "eligible refund support")
    .replaceAll("instant refund", "refund status update")
    .replaceAll("100% tax saving", "eligible deduction support");
}

const oldPlaceholderImageFragments = [
  "hero-premium-consulting",
  "hero-dashboard",
  "individual-itr-filing",
  "small-business-support",
  "compliance-consulting",
  "upload-payment-tracking",
  "contact-consulting-office",
  "blog-tax-guide",
  "blog-business-guide"
];

function cleanImagePath(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  return oldPlaceholderImageFragments.some((fragment) => value.includes(fragment)) ? fallback : value;
}

async function fetchContent<T>(path: string): Promise<T | null> {
  const base = siteConfig.apiBaseUrl.replace(/\/$/, "");
  if (!base) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 800);

  try {
    const response = await fetch(`${base}${path}`, {
      signal: controller.signal,
      next: { revalidate: 300 }
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as ApiPayload<T>;
    return payload.ok && payload.data ? payload.data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getHomepageContent(): Promise<Required<HomepageContent>> {
  const remote = await fetchContent<HomepageContent>("/api/content/homepage");
  return {
    heroTitle: cleanPublicText(remote?.heroTitle, "Tax, GST and business paperwork made simple"),
    heroSubtitle: cleanPublicText(remote?.heroSubtitle, "From ITR filing to GST, notices, loans and business paperwork — get simple support from your phone."),
    heroImage: cleanImagePath(remote?.heroImage, siteConfig.images.heroPremium),
    primaryCtaLabel: cleanPublicText(remote?.primaryCtaLabel, "Start ITR Filing"),
    primaryCtaHref: remote?.primaryCtaHref || "/start",
    secondaryCtaLabel: cleanPublicText(remote?.secondaryCtaLabel, "Request Call Back"),
    secondaryCtaHref: remote?.secondaryCtaHref || "/quick-contact",
    finalCtaTitle: cleanPublicText(remote?.finalCtaTitle, "Need help today?"),
    finalCtaDescription: cleanPublicText(remote?.finalCtaDescription, "Start ITR filing, upload documents, or enter your phone number. We will guide you in simple steps."),
    trustBadges: remote?.trustBadges || [],
    faqs: remote?.faqs || homeFaqs,
    testimonials: remote?.testimonials || testimonials,
    sectionVisibility: remote?.sectionVisibility || {}
  };
}

export async function getPricingContent(): Promise<PricingContent> {
  return (await fetchContent<PricingContent>("/api/content/pricing")) || [...pricingPlans];
}

export async function getServiceContent(slug: string): Promise<ServiceContentOverride | null> {
  const remote = await fetchContent<ServiceContentOverride>(`/api/content/service/${encodeURIComponent(slug)}`);
  if (!remote) return null;
  return {
    ...remote,
    heroImage: cleanImagePath(remote.heroImage, ""),
    title: remote.title ? cleanPublicText(remote.title, "") : undefined,
    subtitle: remote.subtitle ? cleanPublicText(remote.subtitle, "") : undefined,
    pricingText: remote.pricingText ? cleanPublicText(remote.pricingText, "") : undefined,
    seoTitle: remote.seoTitle ? cleanPublicText(remote.seoTitle, "") : undefined,
    seoDescription: remote.seoDescription ? cleanPublicText(remote.seoDescription, "") : undefined
  };
}
