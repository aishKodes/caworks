export const attributionKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "landing_page",
  "referrer"
] as const;

export type AttributionKey = (typeof attributionKeys)[number];
export type AttributionPayload = Partial<Record<AttributionKey, string>>;

type TrackOptions = {
  sendConversion?: boolean;
};

type EventPayload = AttributionPayload & {
  service?: string;
  page_path?: string;
  timestamp?: string;
  request_id?: string;
  event_category?: string;
  event_label?: string;
  link_url?: string;
  source?: string;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

const storageKey = "vbc_attribution";
const cookieKey = "vbc_attribution";
const thankYouStoragePrefix = "vbc_upload_path_";

function isBrowser() {
  return typeof window !== "undefined";
}

function clean(value: string | null | undefined) {
  return (value || "").trim().slice(0, 500);
}

function readStoredAttribution(): AttributionPayload {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) return JSON.parse(raw) as AttributionPayload;
  } catch {
  }
  try {
    const rawCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${cookieKey}=`))
      ?.split("=")[1];
    return rawCookie ? (JSON.parse(decodeURIComponent(rawCookie)) as AttributionPayload) : {};
  } catch {
    return {};
  }
}

function writeStoredAttribution(value: AttributionPayload) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
  }
  try {
    const encoded = encodeURIComponent(JSON.stringify(value));
    document.cookie = `${cookieKey}=${encoded}; Max-Age=${60 * 60 * 24 * 30}; Path=/; SameSite=Lax`;
  } catch {
  }
}

export function captureAttribution(): AttributionPayload {
  if (!isBrowser()) return {};
  const params = new URLSearchParams(window.location.search);
  const current = readStoredAttribution();
  const next: AttributionPayload = { ...current };
  let changed = false;

  for (const key of attributionKeys) {
    if (key === "landing_page" || key === "referrer") continue;
    const value = clean(params.get(key));
    if (value) {
      next[key] = value;
      changed = true;
    }
  }

  if (!next.landing_page) {
    next.landing_page = `${window.location.pathname}${window.location.search}`;
    changed = true;
  }
  if (!next.referrer && document.referrer) {
    next.referrer = document.referrer.slice(0, 500);
    changed = true;
  }

  if (changed) writeStoredAttribution(next);
  return next;
}

export function getStoredAttribution(): AttributionPayload {
  return isBrowser() ? { ...captureAttribution(), ...readStoredAttribution() } : {};
}

export function appendAttributionToFormData(formData: FormData) {
  const attribution = getStoredAttribution();
  for (const [key, value] of Object.entries(attribution)) {
    if (value && !formData.has(key)) {
      formData.append(key, value);
    }
  }
}

function conversionLabelFor(eventName: string, service?: string) {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID?.trim();
  if (!adsId) return "";
  const labels: Record<string, string | undefined> = {
    insurance_lead_submit: process.env.NEXT_PUBLIC_GOOGLE_ADS_INSURANCE_LEAD_LABEL,
    guest_request_submit: process.env.NEXT_PUBLIC_GOOGLE_ADS_FORM_SUBMIT_LABEL,
    thank_you_view: service?.includes("insurance")
      ? process.env.NEXT_PUBLIC_GOOGLE_ADS_INSURANCE_LEAD_LABEL
      : process.env.NEXT_PUBLIC_GOOGLE_ADS_FORM_SUBMIT_LABEL,
    whatsapp_click: process.env.NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_CLICK_LABEL,
    phone_click: process.env.NEXT_PUBLIC_GOOGLE_ADS_PHONE_CLICK_LABEL,
    document_upload_submit: process.env.NEXT_PUBLIC_GOOGLE_ADS_DOCUMENT_UPLOAD_LABEL
  };
  const label = labels[eventName]?.trim();
  return label ? `${adsId}/${label}` : "";
}

function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}

function shouldSendLeadEvent(eventName: string) {
  return [
    "insurance_lead_submit",
    "guest_request_submit",
    "document_upload_submit",
    "whatsapp_click",
    "phone_click",
    "service_cta_click",
    "upload_documents_click",
    "form_start",
    "form_error",
    "thank_you_view"
  ].includes(eventName);
}

function sendLeadEvent(eventName: string, payload: EventPayload) {
  const base = apiBaseUrl();
  if (!base || !shouldSendLeadEvent(eventName)) return;
  const body = JSON.stringify({
    event_name: eventName,
    ...payload,
    attribution: getStoredAttribution()
  });
  try {
    void fetch(`${base}/api/lead-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      credentials: "include",
      keepalive: true,
      cache: "no-store"
    });
  } catch {
  }
}

export function trackEvent(eventName: string, payload: EventPayload = {}, options: TrackOptions = {}) {
  if (!isBrowser()) return;
  const attribution = getStoredAttribution();
  const eventPayload: EventPayload = {
    ...attribution,
    ...payload,
    page_path: payload.page_path || window.location.pathname,
    timestamp: new Date().toISOString()
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...eventPayload });
  sendLeadEvent(eventName, eventPayload);

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, eventPayload);
    const shouldSendConversion = options.sendConversion !== false;
    const sendTo = shouldSendConversion ? conversionLabelFor(eventName, eventPayload.service) : "";
    if (sendTo) {
      window.gtag("event", "conversion", {
        send_to: sendTo,
        event_category: eventPayload.event_category || "lead",
        event_label: eventPayload.event_label || eventPayload.service || eventName,
        service: eventPayload.service,
        request_id: eventPayload.request_id
      });
    }
  }
}

export function storeUploadPathForRequest(requestId: string, uploadPath: string) {
  if (!isBrowser() || !requestId || !uploadPath) return;
  try {
    window.localStorage.setItem(`${thankYouStoragePrefix}${requestId}`, uploadPath);
  } catch {
  }
}

export function getUploadPathForRequest(requestId: string) {
  if (!isBrowser() || !requestId) return "";
  try {
    return window.localStorage.getItem(`${thankYouStoragePrefix}${requestId}`) || "";
  } catch {
    return "";
  }
}
