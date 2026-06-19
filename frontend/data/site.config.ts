import { imageConfig } from "@/data/images";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com").replace(/\/$/, "");
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Vedanath Business Consultants";

export const siteConfig = {
  name: brandName,
  legalName: brandName,
  tagline: "Tax, GST, loans and business paperwork made simple.",
  defaultTitle: "Vedanath Business Consultants | Online Tax, GST and Business Paperwork Help",
  description:
    "File ITR, get GST help, upload documents, pay securely and track tax, loan and business paperwork requests from your phone.",
  siteUrl,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919000000000",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  email: "support@vedanath.example",
  phone: "+91 90000 00000",
  upiId: "vedanath@upi",
  address: "Vedanath Business Consultants, Office address placeholder, Bhubaneswar, Odisha 751001",
  city: "Bhubaneswar",
  region: "Odisha",
  country: "IN",
  images: imageConfig
} as const;

export function getWhatsAppUrl(message = "Hello, I need help with tax or business paperwork.") {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
