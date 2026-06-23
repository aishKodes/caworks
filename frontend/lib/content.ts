import { blogPosts, type BlogPost } from "@/data/blogPosts";
import { homeFaqs, type FAQItem } from "@/data/faqs";
import { pricingPlans } from "@/data/pricing";
import { services, type Service } from "@/data/services";
import { siteConfig } from "@/data/site.config";
import { testimonials } from "@/data/testimonials";
import { fetchCms } from "@/lib/cms";

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
  insuranceTitle?: string;
  insuranceSubtitle?: string;
  insuranceProblems?: string[];
  trustBadges?: Array<{ title: string; text: string }>;
  faqs?: FAQItem[];
  testimonials?: ReadonlyArray<{ name: string; role?: string; context?: string; quote: string; image?: string; avatar?: string }>;
  sectionVisibility?: Record<string, boolean>;
};

export type PricingContent = Array<{
  name: string;
  price: string;
  description: string;
  features: readonly string[];
}>;

export type SiteSettingsContent = {
  business_name?: string;
  registered_business_name?: string;
  tagline?: string;
  phone?: string;
  whatsapp_number?: string;
  support_email?: string;
  address?: string;
  footer_text?: string;
};

export type ServiceContentOverride = {
  slug: string;
  title?: string;
  subtitle?: string;
  category?: string;
  shortDescription?: string;
  heroImage?: string;
  sections?: {
    who?: string[];
    whoFor?: string[];
    whatWeDo?: string[];
    documents?: string[];
    process?: string[];
  };
  pricingText?: string;
  faqs?: FAQItem[];
  seoTitle?: string;
  seoDescription?: string;
  sortOrder?: number;
  showInMenu?: boolean;
  showOnHomepage?: boolean;
};

export type MenuServiceContent = {
  slug: string;
  label: string;
  heroText: string;
  category?: string;
};

function cleanPublicText(value: string | undefined, fallback: string) {
  return (value || fallback)
    .replaceAll("Tax, GST and business paperwork made simple for Indian families and businesses.", "Tax, GST and business paperwork made simple")
    .replaceAll("File ITR, get GST help, upload documents, pay securely and track your request — all from your phone.", "From ITR filing to GST, notices, loans and business paperwork — get simple support from your phone.")
    .replaceAll("Tax, GST and business paperwork made simple", "Tax, GST, Business & Insurance Claim Support Made Simple")
    .replaceAll("From ITR filing to GST, notices, loans and business paperwork — get simple support from your phone.", "From ITR filing and GST compliance to rejected insurance claims and business paperwork, VB Consultants helps you take the next step quickly and professionally.")
    .replaceAll("Start ITR filing, upload documents, or enter your phone number. We will guide you in simple steps.", "Tell us whether you need tax, GST, insurance claim, loan or business paperwork support. We will guide the next step.")
    .replaceAll("Insurance company rejected or delayed your claim?", "Facing Problems with an Insurance Claim?")
    .replaceAll("Rejected does not always mean finished. Share your policy copy, rejection letter and claim papers. Our team helps review the issue, prepare replies, escalate the matter and coordinate legal action where required.", "Don’t worry. We help you with insurance claim documentation, claim processing support, follow-up assistance and escalation support where required.")
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

function cleanAddress(value: string | undefined) {
  const address = (value || "").trim();
  if (!address) return "";
  const placeholderPatterns = [
    /your address here/i,
    /add your address/i,
    /office address placeholder/i,
    /rayagada placeholder/i,
    /123 business street/i,
    /sample address/i,
    /put address here/i
  ];
  return placeholderPatterns.some((pattern) => pattern.test(address)) ? "" : address;
}

export async function getHomepageContent(): Promise<Required<HomepageContent>> {
  const [remote, cmsFaqs, cmsTestimonials] = await Promise.all([
    fetchCms<HomepageContent>("/api/content/homepage"),
    fetchCms<FAQItem[]>("/api/content/faqs?page=homepage"),
    fetchCms<HomepageContent["testimonials"]>("/api/content/testimonials")
  ]);
  return {
    heroTitle: cleanPublicText(remote?.heroTitle, "Tax, GST, Business & Insurance Claim Support Made Simple"),
    heroSubtitle: cleanPublicText(remote?.heroSubtitle, "From ITR filing and GST compliance to rejected insurance claims and business paperwork, VB Consultants helps you take the next step quickly and professionally."),
    heroImage: cleanImagePath(remote?.heroImage, siteConfig.images.heroPremium),
    primaryCtaLabel: remote?.primaryCtaLabel === "Start ITR Filing" ? "Get Help Now" : cleanPublicText(remote?.primaryCtaLabel, "Get Help Now"),
    primaryCtaHref: remote?.primaryCtaHref === "/start" ? "#get-help" : remote?.primaryCtaHref || "#get-help",
    secondaryCtaLabel: remote?.secondaryCtaLabel === "Request Call Back" ? "Upload Documents" : cleanPublicText(remote?.secondaryCtaLabel, "Upload Documents"),
    secondaryCtaHref: remote?.secondaryCtaHref === "/quick-contact" ? "/upload-documents" : remote?.secondaryCtaHref || "/upload-documents",
    finalCtaTitle: cleanPublicText(remote?.finalCtaTitle, "Need practical help today?"),
    finalCtaDescription: cleanPublicText(remote?.finalCtaDescription, "Tell us whether you need tax, GST, insurance claim, loan or business paperwork support. We will guide the next step."),
    insuranceTitle: cleanPublicText(remote?.insuranceTitle, "Facing Problems with an Insurance Claim?"),
    insuranceSubtitle: cleanPublicText(remote?.insuranceSubtitle, "Don’t worry. We help you with insurance claim documentation, claim processing support, follow-up assistance and escalation support where required."),
    insuranceProblems: remote?.insuranceProblems?.length ? remote.insuranceProblems : [],
    trustBadges: remote?.trustBadges || [],
    faqs: remote?.faqs?.length ? remote.faqs : cmsFaqs?.length ? cmsFaqs : homeFaqs,
    testimonials: remote?.testimonials?.length ? remote.testimonials : cmsTestimonials?.length ? cmsTestimonials : testimonials,
    sectionVisibility: remote?.sectionVisibility || {}
  };
}

export async function getPricingContent(): Promise<PricingContent> {
  return (await fetchCms<PricingContent>("/api/content/pricing", { revalidate: 300, timeoutMs: 900 })) || [...pricingPlans];
}

const pricingServiceNames: Record<string, string[]> = {
  "insurance-claim-support": ["insurance claim documentation support", "claim form preparation & submission support", "claim follow-up support", "claim rejection review", "settlement documentation assistance"],
  "insurance-claim-documentation-support": ["insurance claim documentation support"],
  "insurance-claim-rejected": ["claim rejection review"],
  "health-insurance-claim-help": ["health insurance claim assistance"],
  "life-insurance-claim-assistance": ["life insurance claim assistance"],
  "motor-insurance-claim-support": ["motor insurance claim support"],
  "personal-accident-insurance-claim": ["personal accident claim assistance"],
  "claim-form-preparation-support": ["claim form preparation & submission support"],
  "insurance-claim-follow-up": ["claim follow-up support"],
  "settlement-documentation-assistance": ["settlement documentation assistance"],
  "nominee-claim-assistance": ["nominee claim assistance"],
  "mediclaim-reimbursement-help": ["health insurance claim assistance"],
  "cashless-claim-denied": ["health insurance claim assistance"],
  "life-insurance-claim-dispute": ["life insurance claim assistance"],
  "motor-insurance-claim-dispute": ["motor insurance claim support"],
  "property-insurance-claim-help": ["insurance claim documentation support"],
  "insurance-legal-escalation-support": ["claim rejection review"],
  "salary-itr-filing": ["salary itr", "salary itr with review"],
  "itr-1-filing": ["salary itr", "salary itr with review"],
  "itr-2-capital-gains-filing": ["itr-2 / capital gains"],
  "freelancer-business-itr": ["freelancer / business itr"],
  "gst-return-filing": ["gst filing"],
  "gst-services": ["gst filing", "gst registration"],
  "gst-registration": ["gst registration"],
  bookkeeping: ["bookkeeping"],
  "tds-return-filing": ["tds return filing"],
  "payroll-compliance": ["payroll compliance"],
  "tax-notice-help": ["tax notice help"],
  "business-registration": ["business registration"],
  "msme-udyam-registration": ["msme / udyam registration"],
  "loan-project-report": ["loan project report"],
  "subsidy-scheme-guidance": ["subsidy scheme guidance"]
};

export async function getServicePricingNote(slug: string): Promise<string | null> {
  const names = pricingServiceNames[slug] || [];
  if (!names.length) return null;
  const pricing = await getPricingContent();
  const matches = pricing.filter((item) => names.includes(item.name.trim().toLowerCase()));
  if (!matches.length) return null;
  return matches.map((item) => `${item.name}: ${item.price}`).join(" · ");
}

export async function getSiteSettingsContent(): Promise<Required<Pick<SiteSettingsContent, "phone" | "support_email" | "address" | "footer_text">>> {
  const remote = await fetchCms<SiteSettingsContent>("/api/content/site-settings");
  return {
    phone: remote?.phone || siteConfig.phone,
    support_email: remote?.support_email || siteConfig.email,
    address: cleanAddress(remote?.address) || cleanAddress(siteConfig.address),
    footer_text: cleanPublicText(remote?.footer_text, "Online support for ITR filing, GST, insurance claims, loan paperwork and business compliance, built for clear mobile steps.")
      .replace("Online support for ITR filing, GST, loan paperwork, bookkeeping, notices and business compliance.", "Online support for ITR filing, GST, insurance claims, loan paperwork and business compliance.")
  };
}

export async function getServiceContent(slug: string): Promise<ServiceContentOverride | null> {
  const remote = await fetchCms<ServiceContentOverride>(`/api/content/services/${encodeURIComponent(slug)}`);
  if (!remote) return null;
  return {
    ...remote,
    heroImage: cleanImagePath(remote.heroImage, ""),
    category: remote.category,
    shortDescription: remote.shortDescription ? cleanPublicText(remote.shortDescription, "") : undefined,
    sections: remote.sections,
    title: remote.title ? cleanPublicText(remote.title, "") : undefined,
    subtitle: remote.subtitle ? cleanPublicText(remote.subtitle, "") : undefined,
    pricingText: remote.pricingText ? cleanPublicText(remote.pricingText, "") : undefined,
    seoTitle: remote.seoTitle ? cleanPublicText(remote.seoTitle, "") : undefined,
    seoDescription: remote.seoDescription ? cleanPublicText(remote.seoDescription, "") : undefined
  };
}

export async function getServicesContent(): Promise<ServiceContentOverride[]> {
  const remote = await fetchCms<ServiceContentOverride[]>("/api/content/services");
  return (remote || []).map((service) => ({
    ...service,
    title: service.title ? cleanPublicText(service.title, "") : undefined,
    subtitle: service.subtitle ? cleanPublicText(service.subtitle, "") : undefined,
    shortDescription: service.shortDescription ? cleanPublicText(service.shortDescription, "") : undefined,
    heroImage: cleanImagePath(service.heroImage, "")
  }));
}

export async function getMenuServices(): Promise<MenuServiceContent[]> {
  const remote = await getServicesContent();
  const remoteItems = remote
    .filter((service) => service.showInMenu !== false && service.slug && service.title)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((service) => ({
      slug: service.slug,
      label: service.title || service.slug,
      heroText: service.shortDescription || service.subtitle || "Simple online support with upload and status tracking.",
      category: service.category
    }));

  if (remoteItems.length) return remoteItems;

  return services.map((service) => ({
    slug: service.slug,
    label: service.label,
    heroText: service.heroText,
    category: service.category
  }));
}

function estimateReadingTime(content: string) {
  const words = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(3, Math.ceil(words / 180))} min read`;
}

type CmsBlogPost = {
  slug: string;
  title: string;
  summary?: string;
  category?: string;
  featured_image?: string;
  content?: string;
  seo_title?: string;
  seo_description?: string;
  tags?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
};

function cmsBlogToPost(post: CmsBlogPost): BlogPost & { contentHtml?: string } {
  const publishedAt = (post.published_at || post.created_at || new Date().toISOString()).slice(0, 10);
  const updatedAt = (post.updated_at || post.published_at || post.created_at || publishedAt).slice(0, 10);
  const content = post.content || "";
  return {
    slug: post.slug,
    title: cleanPublicText(post.title, post.slug),
    metaTitle: cleanPublicText(post.seo_title || post.title, post.title),
    metaDescription: cleanPublicText(post.seo_description || post.summary, "Simple guide from VB Consultants."),
    excerpt: cleanPublicText(post.summary, "Simple guide from VB Consultants."),
    category: post.category || "Guide",
    image: cleanImagePath(post.featured_image, siteConfig.images.blogThumbTax),
    readingTime: estimateReadingTime(content || post.summary || post.title),
    publishedAt,
    updatedAt,
    tags: (post.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    sections: [],
    relatedServices: [],
    contentHtml: content
  };
}

export async function getBlogContent(): Promise<Array<BlogPost & { contentHtml?: string }>> {
  const remote = await fetchCms<CmsBlogPost[]>("/api/content/blog");
  if (!remote?.length) return blogPosts;
  const remotePosts = remote.map(cmsBlogToPost);
  const remoteSlugs = new Set(remotePosts.map((post) => post.slug));
  return [...remotePosts, ...blogPosts.filter((post) => !remoteSlugs.has(post.slug))];
}

export async function getBlogPostContent(slug: string): Promise<(BlogPost & { contentHtml?: string }) | null> {
  const remote = await fetchCms<CmsBlogPost>(`/api/content/blog/${encodeURIComponent(slug)}`);
  if (remote) return cmsBlogToPost(remote);
  return blogPosts.find((post) => post.slug === slug) || null;
}

export type LocalPageContent = {
  city?: string;
  state?: string;
  slug: string;
  title: string;
  heroTitle?: string;
  bodyContent?: string;
  relatedServices?: string[];
  faqs?: FAQItem[];
  metaTitle?: string;
  metaDescription?: string;
  imagePath?: string;
};

export async function getLocalPageContent(slug: string): Promise<LocalPageContent | null> {
  return fetchCms<LocalPageContent>(`/api/content/local-pages/${encodeURIComponent(slug)}`);
}

function normalizeCategory(category?: string): Service["category"] {
  const value = (category || "").toLowerCase();
  if (value.includes("insurance")) return "insurance";
  if (value.includes("gst")) return "gst";
  if (value.includes("loan")) return "loan";
  if (value.includes("business") || value.includes("compliance")) return "business";
  if (value.includes("support")) return "support";
  if (value.includes("local")) return "local";
  return "itr";
}

export function serviceFromCmsContent(override: ServiceContentOverride): Service {
  const sections = override.sections || {};
  const title = override.title || override.slug;
  return {
    slug: override.slug,
    label: title,
    category: normalizeCategory(override.category),
    metaTitle: override.seoTitle || `${title} | ${siteConfig.name}`,
    metaDescription: override.seoDescription || override.subtitle || `${title} support from ${siteConfig.name}.`,
    heroTitle: title,
    heroText: override.subtitle || override.shortDescription || "Start with your phone number, upload documents and track status online.",
    whoFor: sections.whoFor || sections.who || ["People who need simple online support for this service."],
    whatWeDo: sections.whatWeDo || ["Check shared details", "Prepare a clear document list", "Confirm fee before work starts", "Share status updates"],
    documents: sections.documents || ["Upload relevant documents if available", "Our team will ask if anything is missing"],
    process: sections.process || ["Enter phone number", "Upload documents", "Fee is confirmed", "Track status online"],
    priceNote: override.pricingText || "Final fee depends on documents, income type and complexity.",
    faqs: override.faqs || [],
    related: []
  };
}
