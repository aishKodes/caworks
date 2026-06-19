import Image from "next/image";
import { imageConfig } from "@/data/images";

const badges = [
  { title: "Secure document upload", text: "Upload files from your phone.", image: imageConfig.trustSecure },
  { title: "Razorpay payment", text: "Pay online using supported methods.", image: imageConfig.trustRazorpay },
  { title: "Manual payment screenshot", text: "Upload screenshot after UPI payment.", image: imageConfig.trustPrivacy },
  { title: "WhatsApp support", text: "Get simple request updates.", image: imageConfig.trustWhatsapp },
  { title: "Simple mobile process", text: "Start, upload, pay and track.", image: imageConfig.trustSecure },
  { title: "Status tracking", text: "See what is pending.", image: imageConfig.trustPrivacy },
  { title: "No false refund promises", text: "Final result depends on records.", image: imageConfig.trustSecure },
  { title: "Clear pricing", text: "Fee is confirmed before work.", image: imageConfig.trustRazorpay }
];

export function TrustBadges() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((badge) => (
        <div key={badge.title} className="rounded-2xl border border-charcoal-900/10 bg-white p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <Image src={badge.image} alt="" width={36} height={36} className="h-9 w-9" />
            <div>
              <p className="font-semibold text-charcoal-900">{badge.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{badge.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
