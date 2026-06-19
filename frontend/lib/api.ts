"use client";

import { siteConfig } from "@/data/site.config";

export type ApiResult<T = unknown> = {
  ok: boolean;
  data?: T;
  message?: string;
};

export type QuickLeadPayload = {
  name?: string;
  phone: string;
  service?: string;
  message?: string;
  sourcePage?: string;
  honeypot?: string;
  utm?: Record<string, string>;
};

export type SignupPayload = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  consent: boolean;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type ServiceRequestPayload = {
  serviceType: string;
  incomeType?: string;
  city?: string;
  details?: string;
};

export type ContactPayload = {
  name: string;
  phone: string;
  email?: string;
  service?: string;
  message: string;
  honeypot?: string;
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

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
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

  const response = await fetch(`${base}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });

  let payload: ApiResult<T>;
  try {
    payload = (await response.json()) as ApiResult<T>;
  } catch {
    payload = { ok: response.ok, message: response.ok ? "Done" : "Something went wrong." };
  }

  if (!response.ok) {
    return { ok: false, message: payload.message || "Something went wrong." };
  }

  return payload;
}

function jsonRequest<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

export function submitQuickLead(payload: QuickLeadPayload) {
  return jsonRequest("/api/quick-lead", payload);
}

export async function signup(payload: SignupPayload) {
  const result = await jsonRequest<{ token: string; user: UserSummary }>("/api/signup", payload);
  if (result.ok && result.data?.token) {
    setStoredToken(result.data.token);
  }
  return result;
}

export async function login(payload: LoginPayload) {
  const result = await jsonRequest<{ token: string; user: UserSummary }>("/api/login", payload);
  if (result.ok && result.data?.token) {
    setStoredToken(result.data.token);
  }
  return result;
}

export async function logout() {
  const result = await jsonRequest("/api/logout", {});
  clearStoredToken();
  return result;
}

export function getMe() {
  return request<UserSummary>("/api/me");
}

export function createServiceRequest(payload: ServiceRequestPayload) {
  return jsonRequest<{ request: ServiceRequestSummary }>("/api/service-request", payload);
}

export function getMyRequests() {
  return request<ServiceRequestSummary[]>("/api/my-requests");
}

export function getRequest(id: string) {
  return request<ServiceRequestDetail>(`/api/request/${encodeURIComponent(id)}`);
}

export function uploadDocuments(formData: FormData) {
  return request("/api/upload-documents", {
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
  return request("/api/manual-payment-screenshot", {
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
    original_name: string;
    size: number;
    created_at: string;
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
