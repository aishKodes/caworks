import type { Metadata } from "next";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileBottomCTA } from "@/components/MobileBottomCTA";
import { SEOJsonLd } from "@/components/SEOJsonLd";
import { AuthProvider } from "@/components/AuthProvider";
import { TrackingBootstrap } from "@/components/TrackingBootstrap";
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
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  const ga4Id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim();
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID?.trim();
  const googleTagId = ga4Id || adsId;
  return (
    <html lang="en-IN">
      <body>
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <SEOJsonLd data={[getOrganizationSchema(), getProfessionalServiceSchema(), getWebSiteSchema()]} />
        {gtmId ? (
          <Script id="vbc-gtm" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        ) : null}
        {googleTagId ? <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`} strategy="afterInteractive" /> : null}
        {googleTagId ? (
          <Script id="vbc-gtag" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              ${ga4Id ? `gtag('config', '${ga4Id}');` : ""}
              ${adsId ? `gtag('config', '${adsId}');` : ""}
            `}
          </Script>
        ) : null}
        <AuthProvider>
          <TrackingBootstrap />
          <Header menuServices={menuServices} />
          <main className="pb-20 md:pb-0">{children}</main>
          <Footer />
          <MobileBottomCTA />
        </AuthProvider>
      </body>
    </html>
  );
}
