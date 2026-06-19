import Link from "next/link";

type Breadcrumb = {
  name: string;
  href: string;
};

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="container-shell pt-8">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <li>
          <Link href="/" className="transition hover:text-brand-700">
            Home
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.href} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            <Link href={item.href} className="font-medium text-charcoal-900 transition hover:text-brand-700">
              {item.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
