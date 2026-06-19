import { ServiceCard } from "@/components/ServiceCard";
import { popularServiceSlugs, services } from "@/data/services";

export function ServiceGrid() {
  const selected = popularServiceSlugs
    .map((slug) => services.find((service) => service.slug === slug))
    .filter((service): service is NonNullable<typeof service> => Boolean(service));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {selected.map((service) => (
        <ServiceCard key={service.slug} service={service} />
      ))}
    </div>
  );
}
