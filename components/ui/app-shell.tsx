"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PerforatedDivider } from "./perforated-divider";

const navItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "المنتجات" },
  { href: "/performance", label: "الأداء" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="grid min-h-screen lg:grid-cols-[256px_1fr]">
      <aside className="relative border-b border-hairline bg-paper px-5 py-6 lg:border-b-0">
        <div className="flex items-center justify-between gap-4 lg:block">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-tape-deep">
              Packora
            </p>
            <h1 className="mt-1 text-2xl font-bold">لوحة التشغيل</h1>
          </div>
        </div>

        <nav className="mt-6 flex gap-2 overflow-x-auto lg:mt-8 lg:block lg:space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block shrink-0 rounded-sm px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:bg-kraft-deep/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pointer-events-none absolute inset-y-0 -left-px hidden w-px lg:block">
          <PerforatedDivider orientation="vertical" className="h-full" />
        </div>
      </aside>

      <main className="px-4 py-6 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
}
