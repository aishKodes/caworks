"use client";

import { siteConfig } from "@/data/site.config";
import { appendAttributionToFormData, getStoredAttribution, type AttributionPayload } from "@/lib/tracking";

export type ApiResult<T = unknown> = {
  ok: boolean;
  data?: T;
  message?: string;
  status?: number;
  request_id?: string;
  networkError?: boolean;
};

export type QuickLeadPayload = {
  name?: string;
  phone: string;
  service?: string;
  message?: string;
  sourcePage?: string;
  honeypot?: string;
  utm?: Record<string, string>;
  attribution?: AttributionPayload;
};

export type SignupPayload = {
  fullName?: string;
  name?: string;
  phone: string;
  email?: string;
  password: string;
  consent?: boolean;
  service?: string;
  intent?: string;
  returnTo?: string;
  attribution?: AttributionPayload;
};

export type GuestRequestPayload = {
  name: string;
  phone: string;
  email?: string;
  service_slug: string;
  claim_type?: string;
  message?: string;
  honeypot?: string;
  attribution?: AttributionPayload;
};

export type GuestRequestResult = {
  request_id: string;
  request_db_id: number;
  upload_token: string;
  upload_url: string;
  upload_path: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
  remember?: boolean;
};

export type ServiceRequestPayload = {
  serviceType: string;
  claimType?: string;
  incomeType?: string;
  city?: string;
  details?: string;
  attribution?: AttributionPayload;
};

export type ContactPayload = {
  name: string;
  phone: string;
  email?: string;
  service?: string;
  message: string;
  honeypot?: string;
  attribution?: AttributionPayload;
};

function apiBaseUrl() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

export function getStoredToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem("tax_help_token") || "";
}

export function setStoredToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("tax_help_token", token);
  }
}

export function clearStoredToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("tax_help_token");
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  const base = apiBaseUrl();
  if (!base) {
    return {
      ok: false,
      message: "Backend is not configured. Please use WhatsApp or try again later."
    };
  }

  const headers = new Headers(options.headers);
  const token = getStoredToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      ...options,
      headers,
      credentials: "include",
      cache: options.cache ?? "no-store"
    });
  } catch {
    return {
      ok: false,
      message: "We could not reach the server. Please check your connection and try again.",
      networkError: true
    };
  }

  let payload: ApiResult<T>;
  try {
    payload = (await response.json()) as ApiResult<T>;
  } catch {
    payload = { ok: response.ok, message: response.ok ? "Done" : "Something went wrong." };
  }

  if (!response.ok) {
    return { ok: false, message: payload.message || "Something went wrong.", status: response.status, request_id: payload.request_id };
  }

  return { ...payload, status: response.status };
}

function withAttribution(body: unknown) {
  if (!body || typeof body !== "object" || body instanceof FormData) return body;
  const payload = body as Record<string, unknown>;
  return {
    ...payload,
    attribution: {
      ...((payload.attribution as Record<string, string> | undefined) || {}),
      ...getStoredAttribution()
    }
  };
}

function jsonRequest<T>(path: string, body: unknown) {
  return apiFetch<T>(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(withAttribution(body))
  });
}

export function submitQuickLead(payload: QuickLeadPayload) {
  return jsonRequest("/api/quick-lead", payload);
}

export function submitGuestRequest(payload: GuestRequestPayload) {
  return jsonRequest<GuestRequestResult>("/api/guest-request", payload);
}

export async function signup(payload: SignupPayload) {
  const result = await jsonRequest<{ token?: string; user: UserSummary }>("/api/signup", payload);
  if (result.ok && result.data?.token) {
    setStoredToken(result.data.token);
  } else if (result.ok) {
    clearStoredToken();
  }
  return result;
}

export async function login(payload: LoginPayload) {
  const result = await jsonRequest<{ token?: string; user: UserSummary }>("/api/login", payload);
  if (result.ok && result.data?.token) {
    setStoredToken(result.data.token);
  } else if (result.ok) {
    clearStoredToken();
  }
  return result;
}

export async function logout() {
  const result = await jsonRequest("/api/logout", {});
  clearStoredToken();
  return result;
}

export async function getCurrentUser() {
  const first = await apiFetch<UserSummary>("/api/me");
  if (!first.networkError) return first;
  return apiFetch<UserSummary>("/api/me");
}

export function getMe() {
  return getCurrentUser();
}

export function createServiceRequest(payload: ServiceRequestPayload) {
  return jsonRequest<{ request: ServiceRequestSummary }>("/api/service-request", payload);
}

export function getMyRequests() {
  return apiFetch<ServiceRequestSummary[]>("/api/my-requests");
}

export function getRequest(id: string) {
  return apiFetch<ServiceRequestDetail>(`/api/request/${encodeURIComponent(id)}`);
}

export function uploadDocuments(formData: FormData) {
  appendAttributionToFormData(formData);
  return apiFetch("/api/upload-documents", {
    method: "POST",
    body: formData
  });
}

export function createRazorpayOrder(requestId: string, amount: number) {
  return jsonRequest<{ order_id: string; amount: number; currency: string }>("/api/create-razorpay-order", {
    request_id: requestId,
    amount
  });
}

export function verifyRazorpayPayment(payload: Record<string, string>) {
  return jsonRequest("/api/verify-razorpay-payment", payload);
}

export function submitManualPayment(formData: FormData) {
  return apiFetch("/api/manual-payment-screenshot", {
    method: "POST",
    body: formData
  });
}

export function submitContact(payload: ContactPayload) {
  return jsonRequest("/api/contact", payload);
}

export type UserSummary = {
  id: number;
  tax_help_id: string;
  full_name: string;
  name?: string;
  phone: string;
  email: string;
};

export type ServiceRequestSummary = {
  id: number;
  request_code: string;
  service_type: string;
  status: string;
  city?: string;
  quoted_amount?: number;
  payment_status?: string;
  created_at: string;
};

export type ServiceRequestDetail = ServiceRequestSummary & {
  details?: string;
  documents?: Array<{
    id: number;
    document_type: string;
    document_label?: string;
    original_name: string;
    size: number;
    created_at: string;
    uploaded_at?: string;
  }>;
  payments?: Array<{
    id: number;
    amount: number;
    method: string;
    status: string;
    created_at: string;
  }>;
  status_updates?: Array<{
    status: string;
    note?: string;
    created_at: string;
  }>;
};
