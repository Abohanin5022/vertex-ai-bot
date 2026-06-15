"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  FileText,
  Mail,
  Package,
  Scale,
  ShoppingCart,
  Store,
  Tag,
  User,
} from "lucide-react";

export type MenuProduct = {
  id: string;
  name: string;
  category?: string | null;
};

const productLinks = [
  { href: "/packora-1", label: "جميع المنتجات" },
  { href: "/packora-1?category=packaging", label: "التغليف والبلاستيك" },
  { href: "/categories", label: "الأقسام" },
  { href: "/offers", label: "العروض" },
];

const menuLinks = [
  { href: "/stores", label: "المتاجر", icon: Store },
  { href: "/offers", label: "العروض", icon: Tag },
  { href: "/packora-1/login", label: "حسابي", icon: User },
  { href: "/packora-1/cart", label: "السلة", icon: ShoppingCart },
  { href: "/privacy", label: "سياسة الخصوصية", icon: FileText },
  { href: "/terms", label: "الشروط والأحكام", icon: Scale },
  { href: "/contact", label: "تواصل معنا", icon: Mail },
];

export function MobileMenu({
  open,
  onClose,
  products = [],
}: {
  open: boolean;
  onClose: () => void;
  products?: MenuProduct[];
}) {
  const [productsOpen, setProductsOpen] = useState(true);
  const visibleProducts = products.slice(0, 8);

  if (!open) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-40 overflow-y-auto bg-white px-5 pb-12 pt-24"
    >
      <nav className="mx-auto grid max-w-md gap-3 text-right text-base font-semibold leading-tight text-[#111827]">
        <section className="overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white">
          <button
            type="button"
            onClick={() => setProductsOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right transition hover:bg-[#FFF7ED]"
            aria-expanded={productsOpen}
          >
            <span className="inline-flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--packora-cyan)] text-[var(--packora-orange)]">
                <Package size={20} />
              </span>
              <span>
                <span className="block">المنتجات</span>
                <span className="mt-1 block text-xs font-normal text-[#6B7280]">
                  {products.length} منتج متاح
                </span>
              </span>
            </span>

            <ChevronDown
              size={20}
              className={`transition ${productsOpen ? "rotate-180" : ""}`}
            />
          </button>

          {productsOpen && (
            <div className="grid gap-1 border-t border-[#E5E7EB] bg-[#FAFAFA] p-2">
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="rounded-2xl px-4 py-3 text-sm text-[#4B5563] transition hover:bg-white hover:text-[var(--packora-blue)]"
                >
                  {link.label}
                </Link>
              ))}

              {visibleProducts.length > 0 && (
                <div className="mt-2 border-t border-[#E5E7EB] pt-2">
                  <p className="px-4 py-2 text-xs font-semibold text-[#9CA3AF]">
                    أحدث المنتجات
                  </p>

                  {visibleProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/packora-1/products/${product.id}`}
                      onClick={onClose}
                      className="block rounded-2xl px-4 py-3 transition hover:bg-white"
                    >
                      <span className="line-clamp-1 text-sm text-[#111827]">
                        {product.name}
                      </span>
                      {product.category && (
                        <span className="mt-1 block text-xs font-normal text-[#6B7280]">
                          {product.category}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {menuLinks.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-[22px] border border-[#E5E7EB] px-5 py-4 transition hover:border-[var(--packora-orange)] hover:bg-[#FFF7ED]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#F8FAFC] text-[#111827]">
                <Icon size={19} />
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
