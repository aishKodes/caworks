import Link from "next/link";
import type { Service } from "@/data/services";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/${service.slug}`} className="group block min-w-0 overflow-hidden rounded-2xl border border-charcoal-900/10 bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-1 hover:border-brand-600/30 hover:shadow-premium">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-lg font-bold text-brand-700">{service.label.slice(0, 1)}</div>
      <h3 className="mt-5 min-w-0 break-words text-lg font-semibold tracking-tight text-charcoal-900">{service.label}</h3>
      <p className="mt-2 min-w-0 break-words text-sm leading-6 text-muted md:line-clamp-3">{service.heroText}</p>
      <span className="mt-5 inline-flex text-sm font-semibold text-brand-700 transition group-hover:translate-x-1">View service</span>
    </Link>
  );
}
