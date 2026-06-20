import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileBottomCTA } from "@/components/MobileBottomCTA";
import { SEOJsonLd } from "@/components/SEOJsonLd";
import { siteConfig } from "@/data/site.config";
import { getOrganizationSchema, getProfessionalServiceSchema } from "@/lib/schema";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    images: [
      {
        url: siteConfig.images.heroPremium,
        width: 1200,
        height: 630,
        alt: siteConfig.defaultTitle
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [siteConfig.images.heroPremium]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>
        <SEOJsonLd data={[getOrganizationSchema(), getProfessionalServiceSchema()]} />
        <Header />
        <main className="pb-20 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomCTA />
      </body>
    </html>
  );
}
