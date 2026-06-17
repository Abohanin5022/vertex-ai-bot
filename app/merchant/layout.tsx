import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  ClipboardList,
  Home,
  Package,
  Settings,
} from "lucide-react";
import { CopyStoreLink } from "@/components/copy-store-link";
import { LogoutButton } from "@/components/logout-button";
import { PackoraLogo } from "@/components/packora-logo";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";

export const metadata: Metadata = {
  title: "Packora 2 Dashboard",
  description:
    "لوحة Packora 2 المستقلة لإدارة المنتجات والطلبات والتحليلات والإعدادات.",
};

const links = [
  { href: "/packora-2", label: "الرئيسية", icon: Home },
  { href: "/packora-2/products", label: "المنتجات", icon: Package },
  { href: "/packora-2/orders", label: "الطلبات", icon: ClipboardList },
  { href: "/packora-2/notifications", label: "الإشعارات", icon: Bell },
  { href: "/packora-2/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/packora-2/settings", label: "الإعدادات", icon: Settings },
];

export default async function MerchantLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole("merchant");
  const storeName = user.storeName || user.name || "متجر Packora";
  const unreadNotificationsCount = await prisma.merchantNotification.count({
    where: {
      userId: user.id,
      readAt: null,
    },
  });

  return (
    <div dir="rtl" className="min-h-screen bg-[var(--packora-soft-pink)] text-[var(--packora-navy)]">
      <aside className="fixed inset-y-0 right-0 z-50 hidden w-80 border-l border-[var(--packora-border)] bg-white p-5 text-[var(--packora-navy)] shadow-[0_28px_90px_rgba(236,72,153,0.10)] lg:flex lg:flex-col">
        <div className="rounded-[24px] border border-[var(--packora-border)] bg-[linear-gradient(135deg,#FCE7F3,#FDF2F8)] p-5">
          <PackoraLogo href="/packora-2" size="desktop" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--packora-blue)]">
            Packora 2
          </p>
        </div>

        <div className="mt-5 rounded-[24px] border border-[var(--packora-border)] bg-[var(--packora-soft-pink)] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[var(--packora-border)] bg-white">
              {user.storeLogo ? (
                <Image
                  src={user.storeLogo}
                  alt={storeName}
                  width={90}
                  height={90}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="text-[var(--packora-blue)]" size={26} />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--packora-blue)]">
                تطبيق التاجر
              </p>
              <h2 className="mt-1 truncate text-lg font-black">{storeName}</h2>
            </div>
          </div>
        </div>

        <nav className="mt-5 grid gap-2">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-bold text-[var(--packora-muted)] transition hover:border-[var(--packora-border)] hover:bg-[var(--packora-light-pink)] hover:text-[var(--packora-blue)]"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--packora-light-pink)] text-[var(--packora-blue)]">
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">{link.label}</span>
                {link.href === "/packora-2/notifications" &&
                unreadNotificationsCount > 0 ? (
                  <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[var(--packora-blue)] px-1 text-xs font-black text-white">
                    {unreadNotificationsCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <CopyStoreLink slug={user.storeSlug} />

          <div className="mt-4">
            <LogoutButton redirectTo="/packora-2/login" />
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-[var(--packora-border)] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[var(--packora-blue)]">Packora 2</p>
            <h1 className="text-lg font-black">لوحة التاجر</h1>
          </div>

          <Link
            href="/packora-2/notifications"
            aria-label="الإشعارات"
            className="relative grid h-11 w-11 place-items-center rounded-full bg-[var(--packora-blue)] text-white"
          >
            <Bell size={19} />
            {unreadNotificationsCount > 0 ? (
              <span className="absolute -top-1 -right-1 grid h-6 min-w-6 place-items-center rounded-full bg-[var(--packora-baby-pink)] px-1 text-xs font-black text-[var(--packora-navy)]">
                {unreadNotificationsCount}
              </span>
            ) : null}
          </Link>
        </div>
      </header>

      <section className="min-w-0 lg:pr-80">{children}</section>
    </div>
  );
}
