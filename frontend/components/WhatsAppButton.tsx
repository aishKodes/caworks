import Link from "next/link";
import { getWhatsAppUrl } from "@/data/site.config";
import { cn } from "@/lib/utils";

type WhatsAppButtonProps = {
  children?: React.ReactNode;
  message?: string;
  className?: string;
  variant?: "solid" | "outline" | "light";
};

export function WhatsAppButton({
  children = "Talk on WhatsApp",
  message,
  className,
  variant = "outline"
}: WhatsAppButtonProps) {
  const styles = {
    solid: "bg-brand-600 text-white shadow-red hover:bg-brand-700",
    outline:
      "border border-charcoal-900/10 bg-white text-charcoal-900 shadow-soft hover:border-brand-600 hover:text-brand-700",
    light: "border border-white/25 bg-white/10 text-white hover:bg-white/20"
  };

  return (
    <Link
      href={getWhatsAppUrl(message)}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition",
        styles[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}
