import Link from "next/link";
import { PhoneLink } from "@/components/PhoneLink";
import { getWhatsAppUrl, whatsappMessages } from "@/data/site.config";

export function MobileBottomCTA() {
  const whatsappUrl = getWhatsAppUrl(whatsappMessages.homepage);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-charcoal-900/10 bg-white/95 px-3 py-2 shadow-[0_-12px_30px_rgba(17,17,17,0.10)] backdrop-blur md:hidden">
      <div className="grid grid-cols-3 gap-2">
        <Link href="/request-service?service=not-sure" className="rounded-full bg-brand-600 px-2 py-3 text-center text-xs font-semibold text-white shadow-red">Get Help</Link>
        <Link href={whatsappUrl || "/contact"} target={whatsappUrl ? "_blank" : undefined} rel={whatsappUrl ? "noopener noreferrer" : undefined} className="rounded-full bg-[#128c4a] px-2 py-3 text-center text-xs font-semibold text-white shadow-[0_12px_24px_rgba(18,140,74,0.22)]">WhatsApp</Link>
        <PhoneLink className="rounded-full border border-charcoal-900/10 px-2 py-3 text-center text-xs font-semibold text-charcoal-900" variant="outline">
          Call Now
        </PhoneLink>
      </div>
    </div>
  );
}
