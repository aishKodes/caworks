import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-shell section-padding">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Page not found</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal-900 md:text-5xl">This page is not available.</h1>
        <p className="mt-5 text-lg leading-8 text-muted">Use the homepage, start a request or enter your phone number.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-red">Go home</Link>
          <Link href="/quick-contact" className="rounded-full border border-charcoal-900/10 px-6 py-3 text-sm font-semibold text-charcoal-900">Enter phone number</Link>
        </div>
      </div>
    </section>
  );
}
