"use client";

import { siteConfig } from "@/data/site.config";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/tracking";

type PhoneLinkProps = {
  phone?: string;
  service?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: "solid" | "outline" | "light";
};

export function PhoneLink({
  phone = siteConfig.phone,
  service,
  children = "Call Now",
  className,
  variant = "outline"
}: PhoneLinkProps) {
  const href = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const styles = {
    solid: "bg-charcoal-900 text-white shadow-soft hover:bg-brand-700",
    outline: "border border-charcoal-900/10 bg-white text-charcoal-900 shadow-soft hover:border-brand-600 hover:text-brand-700",
    light: "border border-white/25 bg-white/10 text-white hover:bg-white/20"
  };
  return (
    <a
      href={href}
      onClick={() => trackEvent("phone_click", { service, event_label: phone })}
      className={cn("inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition", styles[variant], className)}
    >
      {children}
    </a>
  );
}
