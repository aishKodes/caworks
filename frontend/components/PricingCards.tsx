import Link from "next/link";
import { pricingPlans } from "@/data/pricing";
import type { PricingContent } from "@/lib/content";

export function PricingCards({ plans = pricingPlans }: { plans?: PricingContent | typeof pricingPlans }) {
  return (
    <div>
      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan, index) => (
          <div key={plan.name} className={`flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border bg-white p-5 shadow-soft ${index === 0 ? "border-brand-600/30 ring-4 ring-brand-50" : "border-charcoal-900/10"}`}>
            <h3 className="min-w-0 break-words text-lg font-semibold tracking-tight text-charcoal-900">{plan.name}</h3>
            <p className="mt-3 min-w-0 whitespace-normal break-words text-2xl font-semibold leading-tight text-brand-700 sm:text-3xl">{plan.price}</p>
            <p className="mt-3 min-w-0 break-words text-sm leading-6 text-charcoal-700">{plan.description}</p>
            <ul className="mt-5 min-w-0 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex min-w-0 gap-2 text-sm leading-6 text-charcoal-700">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-700">✓</span>
                  <span className="min-w-0 break-words">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/start" className="mt-auto inline-flex min-h-11 items-center pt-6 text-sm font-semibold text-brand-700">Start request</Link>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-6 text-muted">
        Final fee depends on documents, income type and complexity. We confirm the fee before starting work.
      </p>
    </div>
  );
}
