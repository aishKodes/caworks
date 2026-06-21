import Image from "next/image";
import { testimonials } from "@/data/testimonials";

type TestimonialItem = {
  name: string;
  role?: string;
  context?: string;
  quote: string;
  image?: string;
  avatar?: string;
};

export function TestimonialCards({ items = testimonials }: { items?: readonly TestimonialItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <article key={item.name} className="rounded-2xl border border-charcoal-900/10 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <Image src={item.image || item.avatar || "/images/person-placeholder-1.jpg"} alt="" width={52} height={52} className="h-12 w-12 rounded-full object-cover" />
            <div>
              <h3 className="font-semibold text-charcoal-900">{item.name}</h3>
              <p className="text-sm text-muted">{item.role || item.context}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-charcoal-700">“{item.quote}”</p>
        </article>
      ))}
    </div>
  );
}
