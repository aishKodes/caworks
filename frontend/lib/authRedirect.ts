"use client";

import { getMe } from "@/lib/api";

export type AuthIntent =
  | "service_request"
  | "upload_documents"
  | "manual_payment"
  | "payment"
  | "dashboard";

type RedirectOptions = {
  mode?: "signup" | "login";
  intent: AuthIntent | string;
  returnTo: string;
  serviceSlug?: string;
  requestId?: string;
};

function safeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

export function buildAuthRedirectUrl({
  mode = "signup",
  intent,
  returnTo,
  serviceSlug,
  requestId
}: RedirectOptions) {
  const params = new URLSearchParams();
  params.set("intent", intent);
  params.set("returnTo", safeReturnTo(returnTo));
  if (serviceSlug) params.set("service", serviceSlug);
  if (requestId) params.set("requestId", requestId);
  return `/${mode}?${params.toString()}`;
}

export function getPostAuthRedirect(searchParams: { get(name: string): string | null }) {
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const url = new URL(returnTo, "https://www.vbcbharat.com");
  const service = searchParams.get("service");
  const requestId = searchParams.get("requestId");
  const intent = searchParams.get("intent");
  if (service && !url.searchParams.has("service")) url.searchParams.set("service", service);
  if (requestId && !url.searchParams.has("requestId")) url.searchParams.set("requestId", requestId);
  if (intent && !url.searchParams.has("intent")) url.searchParams.set("intent", intent);
  return `${url.pathname}${url.search}`;
}

export async function requireAuthForIntent(
  router: { push(href: string): void },
  intent: AuthIntent | string,
  returnTo: string,
  serviceSlug?: string,
  requestId?: string
) {
  const me = await getMe();
  if (me.ok) {
    return true;
  }
  router.push(buildAuthRedirectUrl({ intent, returnTo, serviceSlug, requestId }));
  return false;
}
