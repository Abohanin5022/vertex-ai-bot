import Link from "next/link";
import type { ComponentType } from "react";
import { Home, LayoutGrid, ShoppingCart, Tag, User } from "lucide-react";

type ActiveItem =
  | "home"
  | "categories"
  | "offers"
  | "orders"
  | "account"
  | "cart"
  | "favorites";

export function PackoraBottomNav({ active }: { active?: ActiveItem }) {
  const items: {
    key: ActiveItem;
    href: string;
    label: string;
    icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  }[] = [
    { key: "home", href: "/packora-1", label: "الرئيسية", icon: Home },
    { key: "categories", href: "/categories", label: "الأقسام", icon: LayoutGrid },
    { key: "offers", href: "/offers", label: "العروض", icon: Tag },
    { key: "cart", href: "/packora-1/cart", label: "السلة", icon: ShoppingCart },
    { key: "account", href: "/packora-1/login", label: "حسابي", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 grid w-full max-w-md -translate-x-1/2 grid-cols-5 border-t border-[var(--packora-border)] bg-white/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 text-center shadow-[0_-12px_30px_rgba(47,101,230,0.08)] backdrop-blur">
      {items.map((item) => {
        const isActive = active === item.key;
        const Icon = item.icon;

        return (
          <Link
            key={item.key}
            href={item.href}
            className={`grid min-h-14 touch-manipulation justify-items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold transition ${
              isActive ? "text-[#111827]" : "text-[#9CA3AF]"
            }`}
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-full ${
                isActive
                  ? "bg-[var(--packora-blue)] text-white"
                  : "bg-transparent"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
