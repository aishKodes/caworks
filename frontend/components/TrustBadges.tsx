import Image from "next/image";
import { imageConfig } from "@/data/images";

const badges = [
  { title: "₹199 onwards ITR filing", text: "Simple salary ITR starts low.", image: imageConfig.trustRazorpay },
  { title: "Secure document upload", text: "Upload from your phone.", image: imageConfig.trustSecure },
  { title: "WhatsApp support", text: "Get help when needed.", image: imageConfig.trustWhatsapp },
  { title: "Clear pricing", text: "Fee is shown before work.", image: imageConfig.trustRazorpay },
  { title: "Status tracking", text: "See what is pending.", image: imageConfig.trustPrivacy },
  { title: "Manual payment option", text: "Upload payment screenshot.", image: imageConfig.trustPrivacy }
];

export function TrustBadges() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {badges.map((badge) => (
        <div key={badge.title} className="rounded-2xl border border-charcoal-900/10 bg-white p-4 shadow-soft">
          <div className="flex items-start gap-3 xl:block">
            <Image src={badge.image} alt="" width={36} height={36} className="h-9 w-9 xl:mb-3" />
            <div>
              <p className="font-semibold text-charcoal-900">{badge.title}</p>
              <p className="mt-1 text-sm leading-6 text-charcoal-700">{badge.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
