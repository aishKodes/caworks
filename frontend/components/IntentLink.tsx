"use client";

import Link from "next/link";
import { MouseEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api";
import { buildAuthRedirectUrl } from "@/lib/authRedirect";

export function IntentLink({
  href,
  intent,
  serviceSlug,
  requestId,
  className,
  children
}: {
  href: string;
  intent: string;
  serviceSlug?: string;
  requestId?: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    const me = await getMe();
    if (me.ok) {
      router.push(href);
      return;
    }
    router.push(buildAuthRedirectUrl({ intent, returnTo: href, serviceSlug, requestId }));
  }

  return (
    <Link href={href} onClick={handleClick} className={className} aria-busy={loading}>
      {loading ? "Checking..." : children}
    </Link>
  );
}
