"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { Heart, Home, LayoutGrid, ShoppingCart, User } from "lucide-react";

type ActiveTab = "home" | "categories" | "cart" | "favorites" | "account";

const links = [
  { href: "/packora-1", label: "الرئيسية", icon: Home, key: "home" },
  { href: "/categories", label: "الأقسام", icon: LayoutGrid, key: "categories" },
  { href: "/packora-1/cart", label: "السلة", icon: ShoppingCart, key: "cart" },
  { href: "/favorites", label: "المفضلة", icon: Heart, key: "favorites" },
  { href: "/packora-1/login", label: "الحساب", icon: User, key: "account" },
] satisfies Array<{
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  key: ActiveTab;
}>;

export function MobileBottomNav({ active }: { active: ActiveTab }) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-md -translate-x-1/2 grid-cols-5 border-t border-[#FED7AA] bg-white px-2 py-2 text-center text-[11px] font-black text-[#64748B] shadow-[0_-8px_24px_rgba(249,115,22,0.12)]">
      {links.map((link) => {
        const Icon = link.icon;

        return (
          <Link
            key={link.key}
            href={link.href}
            className={active === link.key ? "text-[#F97316]" : undefined}
          >
            <div className="grid place-items-center">
              <Icon size={20} strokeWidth={active === link.key ? 2.4 : 1.8} />
            </div>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
