import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileBottomCTA } from "@/components/MobileBottomCTA";
import { SEOJsonLd } from "@/components/SEOJsonLd";
import { AuthProvider } from "@/components/AuthProvider";
import { siteConfig } from "@/data/site.config";
import { getMenuServices } from "@/lib/content";
import { getOrganizationSchema, getProfessionalServiceSchema, getWebSiteSchema } from "@/lib/schema";
import "./globals.css";

export const revalidate = 300;

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
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png"
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    images: [
      {
        url: siteConfig.images.ogDefault,
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
    images: [siteConfig.images.ogDefault]
  }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const menuServices = await getMenuServices();
  return (
    <html lang="en-IN">
      <body>
        <SEOJsonLd data={[getOrganizationSchema(), getProfessionalServiceSchema(), getWebSiteSchema()]} />
        <AuthProvider>
          <Header menuServices={menuServices} />
          <main className="pb-20 md:pb-0">{children}</main>
          <Footer />
          <MobileBottomCTA />
        </AuthProvider>
      </body>
    </html>
  );
}
