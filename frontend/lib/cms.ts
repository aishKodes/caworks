import { siteConfig } from "@/data/site.config";

type CmsPayload<T> = {
  ok: boolean;
  data?: T;
  message?: string;
};

type CmsFetchOptions = {
  revalidate?: number;
  timeoutMs?: number;
};

function cmsBaseUrl() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function warnCms(path: string, message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[cms] ${path}: ${message}`);
  }
}

export async function fetchCms<T>(path: string, options: CmsFetchOptions = {}): Promise<T | null> {
  const base = cmsBaseUrl();
  if (!base) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 2500);
  const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
    signal: controller.signal,
    headers: {
      Accept: "application/json"
    }
  };

  fetchOptions.next = { revalidate: options.revalidate ?? 300 };

  try {
    const response = await fetch(`${base}${path}`, fetchOptions);
    if (!response.ok) {
      warnCms(path, `HTTP ${response.status}`);
      return null;
    }
    const payload = (await response.json()) as CmsPayload<T>;
    if (!payload.ok) {
      warnCms(path, payload.message || "CMS returned ok=false");
      return null;
    }
    return payload.data ?? null;
  } catch (error) {
    warnCms(path, error instanceof Error ? error.message : "CMS fetch failed");
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
