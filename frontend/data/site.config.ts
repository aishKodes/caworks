import { imageConfig } from "@/data/images";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.vbcbharat.com").replace(/\/$/, "");
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "VB Consultants";
const registeredBusinessName = process.env.NEXT_PUBLIC_REGISTERED_BUSINESS_NAME || "Veedanath Business Consultants";

export const siteConfig = {
  name: brandName,
  registeredBusinessName,
  legalName: registeredBusinessName,
  tagline: "Tax, Compliance & Business Support",
  defaultTitle: "VB Consultants | Tax, GST, Insurance Claim and Business Support",
  description:
    "VB Consultants offers practical online support for ITR filing, GST, insurance claim problems, loan project reports and business paperwork in India.",
  siteUrl,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.vbcbharat.com",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919000000000",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  email: (process.env.NEXT_PUBLIC_PUBLIC_EMAIL || "").trim(),
  phone: process.env.NEXT_PUBLIC_PUBLIC_PHONE || "+91 73278 54329",
  upiId: "vbc@upi",
  address: (process.env.NEXT_PUBLIC_OFFICE_ADDRESS || "Bhubaneswar, Odisha").trim(),
  city: "Bhubaneswar",
  region: "Odisha",
  country: "IN",
  images: imageConfig
} as const;

export const whatsappMessages = {
  homepage: "Hello VB Consultants, I need help with tax, GST, an insurance claim or business paperwork. Please contact me.",
  salaryItr: "Hello VB Consultants, I want help with Salary ITR filing.",
  documentUpload: "Hello VB Consultants, I want to send documents for my request.",
  gst: "Hello VB Consultants, I need help with GST filing or registration.",
  notice: "Hello VB Consultants, I need help with a tax notice.",
  loan: "Hello VB Consultants, I need help with loan/project report or subsidy paperwork.",
  insurance: "Hello VB Consultants, I need help with a rejected, delayed or underpaid insurance claim.",
  support: "Hello VB Consultants, I need support with my request."
} as const;

export function getCleanWhatsAppNumber() {
  const digits = siteConfig.whatsappNumber.replace(/\D/g, "");
  return digits.length >= 10 ? digits : "";
}

export function getWhatsAppUrl(message: string = whatsappMessages.homepage) {
  const number = getCleanWhatsAppNumber();
  if (!number) return "";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
