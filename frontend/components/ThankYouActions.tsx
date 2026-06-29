"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { whatsappMessages } from "@/data/site.config";
import { getUploadPathForRequest, trackEvent } from "@/lib/tracking";

function isInsuranceService(service: string) {
  return service.includes("insurance") || service.includes("claim") || service.includes("mediclaim") || service.includes("cashless");
}

export function ThankYouActions({ service, requestId, source }: { service: string; requestId?: string; source?: string }) {
  const uploadPath = useMemo(() => (requestId ? getUploadPathForRequest(requestId) : ""), [requestId]);
  const uploadHref = uploadPath || `/upload-documents?service=${encodeURIComponent(service || "insurance-claim-support")}`;
  const insurance = isInsuranceService(service);

  useEffect(() => {
    const key = `vbc_thank_you_${source || "lead"}_${requestId || service}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    trackEvent("thank_you_view", { service, request_id: requestId, source });
    if (insurance) {
      trackEvent("guest_request_submit", { service, request_id: requestId, source }, { sendConversion: false });
      trackEvent("insurance_lead_submit", { service, request_id: requestId, source });
    } else {
      trackEvent("guest_request_submit", { service, request_id: requestId, source });
    }
  }, [insurance, requestId, service, source]);

  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      <Link href={uploadHref} className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-red transition hover:bg-brand-700">
        {insurance ? "Upload Claim Documents" : "Upload Documents"}
      </Link>
      <WhatsAppButton message={insurance ? whatsappMessages.insurance : whatsappMessages.homepage} variant="solid" service={service}>
        Talk on WhatsApp
      </WhatsAppButton>
      <Link href="/insurance-claim-support" className="inline-flex min-h-12 items-center justify-center rounded-full border border-charcoal-900/10 bg-white px-6 py-3 text-base font-semibold text-charcoal-900 shadow-soft transition hover:border-brand-600 hover:text-brand-700">
        Insurance Claim Support
      </Link>
      <Link href="/#services" className="inline-flex min-h-12 items-center justify-center rounded-full border border-charcoal-900/10 bg-white px-6 py-3 text-base font-semibold text-charcoal-900 shadow-soft transition hover:border-brand-600 hover:text-brand-700">
        Explore Other Services
      </Link>
    </div>
  );
}
