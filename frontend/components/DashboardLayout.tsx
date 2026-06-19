"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe, logout, type UserSummary } from "@/lib/api";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/requests", label: "My requests" },
  { href: "/dashboard/upload", label: "Upload docs" },
  { href: "/start", label: "New request" },
  { href: "/track-status", label: "Track status" }
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then((result) => {
      if (result.ok && result.data) {
        setUser(result.data);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
  }, [router]);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  if (loading) {
    return (
      <section className="container-shell section-padding">
        <div className="rounded-3xl bg-white p-8 shadow-soft">Loading dashboard...</div>
      </section>
    );
  }

  return (
    <section className="container-shell grid gap-6 py-8 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-3xl border border-charcoal-900/10 bg-white p-5 shadow-soft lg:sticky lg:top-24 lg:h-fit">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Tax Help ID</p>
        <p className="mt-2 text-2xl font-semibold text-charcoal-900">{user?.tax_help_id}</p>
        <p className="mt-1 text-sm text-muted">{user?.full_name}</p>
        <nav className="mt-6 grid gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-2xl px-4 py-3 text-sm font-semibold text-charcoal-900 hover:bg-brand-50">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-5 grid gap-3">
          <WhatsAppButton message={`Hello, my Tax Help ID is ${user?.tax_help_id}. I need support.`} className="w-full" />
          <button onClick={handleLogout} className="rounded-full border border-charcoal-900/10 px-4 py-3 text-sm font-semibold text-charcoal-900">Logout</button>
        </div>
      </aside>
      <div>{children}</div>
    </section>
  );
}
