import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  ClipboardList,
  Home,
  Menu,
  Package,
  Settings,
} from "lucide-react";
import { CopyStoreLink } from "@/components/copy-store-link";
import { LogoutButton } from "@/components/logout-button";
import { PackoraLogo } from "@/components/packora-logo";
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

  return (
    <div dir="rtl" className="min-h-screen bg-[#F7FBFF] text-[#070B2A]">
      <aside className="fixed inset-y-0 right-0 z-50 hidden w-80 border-l border-white/10 bg-[#070B2A] p-5 text-white shadow-[0_28px_90px_rgba(7,11,42,0.22)] lg:flex lg:flex-col">
        <div className="rounded-[28px] bg-white p-5">
          <PackoraLogo href="/packora-2" size="desktop" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#1766E8]">
            Packora 2
          </p>
        </div>

        <div className="mt-5 rounded-[28px] border border-white/10 bg-white/8 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white">
              {user.storeLogo ? (
                <Image
                  src={user.storeLogo}
                  alt={storeName}
                  width={90}
                  height={90}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="text-[#1766E8]" size={26} />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#4FE7C5]">
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
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/82 transition hover:bg-[#1766E8] hover:text-white"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#4FE7C5]">
                  <Icon size={18} />
                </span>
                {link.label}
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

      <header className="sticky top-0 z-40 border-b border-[#DCEBFF] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#1766E8]">Packora 2</p>
            <h1 className="text-lg font-black">لوحة التاجر</h1>
          </div>

          <Link
            href="/packora-2/notifications"
            aria-label="الإشعارات"
            className="grid h-11 w-11 place-items-center rounded-full bg-[#070B2A] text-white"
          >
            <Menu size={19} />
          </Link>
        </div>
      </header>

      <section className="min-w-0 lg:pr-80">{children}</section>
    </div>
  );
}
