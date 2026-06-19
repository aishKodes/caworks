import Link from "next/link";
import { pricingPlans } from "@/data/pricing";
import type { PricingContent } from "@/lib/content";

export function PricingCards({ plans = pricingPlans }: { plans?: PricingContent | typeof pricingPlans }) {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {plans.map((plan) => (
          <div key={plan.name} className="flex h-full flex-col rounded-2xl border border-charcoal-900/10 bg-white p-5 shadow-soft">
            <h3 className="text-lg font-semibold tracking-tight text-charcoal-900">{plan.name}</h3>
            <p className="mt-3 text-2xl font-semibold text-brand-700">{plan.price}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{plan.description}</p>
            <ul className="mt-5 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm leading-6 text-charcoal-700">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-700">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/start" className="mt-auto pt-6 text-sm font-semibold text-brand-700">Start request</Link>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-6 text-muted">
        Final fee depends on documents, income sources and complexity. We will confirm before work starts.
      </p>
    </div>
  );
}
