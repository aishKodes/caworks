"use client";

import Link from "next/link";
import type { LinkProps } from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/tracking";

type TrackedLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
  service?: string;
  eventName?: "service_cta_click" | "upload_documents_click";
  eventLabel?: string;
  target?: string;
  rel?: string;
};

export function TrackedLink({
  children,
  className,
  service,
  eventName = "service_cta_click",
  eventLabel,
  href,
  target,
  rel,
  ...props
}: TrackedLinkProps) {
  const linkUrl = typeof href === "string" ? href : href.pathname || "";
  return (
    <Link
      {...props}
      href={href}
      target={target}
      rel={rel}
      className={className}
      onClick={() => {
        trackEvent(eventName, { service, event_label: eventLabel, link_url: linkUrl });
      }}
    >
      {children}
    </Link>
  );
}
