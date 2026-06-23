import type { BlogPost } from "@/data/blogPosts";
import type { FAQItem } from "@/data/faqs";
import type { Service } from "@/data/services";
import { siteConfig } from "@/data/site.config";
import { absoluteUrl } from "@/lib/seo";

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    legalName: siteConfig.registeredBusinessName,
    url: siteConfig.siteUrl,
    logo: absoluteUrl(siteConfig.images.logoMark),
    image: absoluteUrl(siteConfig.images.ogDefault),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phone,
      contactType: "customer support",
      areaServed: "IN",
      availableLanguage: ["en", "hi", "or", "bn", "te"]
    }
  };
}

export function getProfessionalServiceSchema() {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    legalName: siteConfig.registeredBusinessName,
    url: siteConfig.siteUrl,
    image: absoluteUrl(siteConfig.images.ogDefault),
    telephone: siteConfig.phone,
    email: siteConfig.email,
    priceRange: "₹₹",
    areaServed: ["India", "Odisha", "Bhubaneswar"]
  };
  if (siteConfig.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressLocality: siteConfig.city,
      addressRegion: siteConfig.region,
      addressCountry: siteConfig.country
    };
  }
  return schema;
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: absoluteUrl(siteConfig.images.logoMark)
    }
  };
}

export function getServiceSchema(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.label,
    description: service.metaDescription,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.siteUrl
    },
    areaServed: "IN",
    url: absoluteUrl(`/${service.slug}`)
  };
}

export function getFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

export function getBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function getArticleSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: siteConfig.name
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(siteConfig.images.logoMark)
      }
    },
    image: absoluteUrl(post.image),
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`)
  };
}
