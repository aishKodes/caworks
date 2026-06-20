import { imageConfig } from "@/data/images";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.vbcbharat.com").replace(/\/$/, "");
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "VB Consultants";
const registeredBusinessName = process.env.NEXT_PUBLIC_REGISTERED_BUSINESS_NAME || "Veedanath Business Consultants";

export const siteConfig = {
  name: brandName,
  registeredBusinessName,
  legalName: registeredBusinessName,
  tagline: "Tax, Compliance & Business Support",
  defaultTitle: "VB Consultants | Online Tax, GST and Business Paperwork Help",
  description:
    "VB Consultants offers simple online ITR filing, GST, tax notice, loan project report and business compliance support for Indian individuals and small businesses.",
  siteUrl,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.vbcbharat.com",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919000000000",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  email: "support@vbcbharat.com",
  phone: "+91 90000 00000",
  upiId: "vbc@upi",
  address: "Office address placeholder, Bhubaneswar, Odisha 751001",
  city: "Bhubaneswar",
  region: "Odisha",
  country: "IN",
  images: imageConfig
} as const;

export function getWhatsAppUrl(message = "Hello, I need help with tax or business paperwork.") {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
