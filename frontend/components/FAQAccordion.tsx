import type { FAQItem } from "@/data/faqs";

export function FAQAccordion({ faqs }: { faqs: FAQItem[] }) {
  return (
    <div className="divide-y divide-charcoal-900/10 rounded-2xl border border-charcoal-900/10 bg-white shadow-soft">
      {faqs.map((faq) => (
        <details key={faq.question} className="group p-5 open:bg-brand-50/40">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-semibold text-charcoal-900">
            <span>{faq.question}</span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-charcoal-900 text-lg leading-none text-white transition group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
