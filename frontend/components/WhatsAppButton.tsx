"use client";

import Link from "next/link";
import { getWhatsAppUrl } from "@/data/site.config";
import { trackEvent } from "@/lib/tracking";
import { cn } from "@/lib/utils";

type WhatsAppButtonProps = {
  children?: React.ReactNode;
  message?: string;
  className?: string;
  variant?: "solid" | "outline" | "light";
  service?: string;
};

export function WhatsAppButton({
  children = "Talk on WhatsApp",
  message,
  className,
  variant = "outline",
  service
}: WhatsAppButtonProps) {
  const url = getWhatsAppUrl(message);
  const styles = {
    solid: "bg-[#128c4a] text-white shadow-[0_16px_34px_rgba(18,140,74,0.22)] hover:bg-[#0f7a40]",
    outline:
      "border border-[#128c4a]/25 bg-white text-[#0f7a40] shadow-soft hover:border-[#128c4a] hover:bg-[#f0fff6]",
    light: "border border-white/25 bg-white/10 text-white hover:bg-white/20"
  };

  return (
    <Link
      href={url || "/contact"}
      target={url ? "_blank" : undefined}
      rel={url ? "noopener noreferrer" : undefined}
      aria-label={url ? "Open WhatsApp support" : "Open contact page"}
      onClick={() => {
        if (url) trackEvent("whatsapp_click", { service, event_label: service || "general" });
      }}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition",
        styles[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}
