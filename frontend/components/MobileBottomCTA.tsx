import Link from "next/link";
import { getWhatsAppUrl } from "@/data/site.config";

export function MobileBottomCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-charcoal-900/10 bg-white/95 px-3 py-2 shadow-[0_-12px_30px_rgba(17,17,17,0.10)] backdrop-blur md:hidden">
      <div className="grid grid-cols-4 gap-2">
        <Link href="/start" className="rounded-full bg-brand-600 px-2 py-2 text-center text-xs font-semibold text-white">File ITR</Link>
        <Link href="/upload-documents" className="rounded-full border border-charcoal-900/10 px-2 py-2 text-center text-xs font-semibold text-charcoal-900">Upload Docs</Link>
        <Link href={getWhatsAppUrl()} target="_blank" rel="noreferrer" className="rounded-full border border-brand-600 px-2 py-2 text-center text-xs font-semibold text-brand-700">WhatsApp</Link>
        <Link href="/track-status" className="rounded-full border border-charcoal-900/10 px-2 py-2 text-center text-xs font-semibold text-charcoal-900">Track</Link>
      </div>
    </div>
  );
}
