"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";

export type CustomerProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string | null;
};

type Props = {
  product: CustomerProduct;
};

export function ProductCard({ product }: Props) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#EEF2F7] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(17,24,39,0.08)]">
      <div className="absolute left-2 top-2 z-10">
        <FavoriteButton product={product} />
      </div>

      <Link href={`/packora-1/products/${product.id}`} className="block">
        <div className="grid h-36 place-items-center bg-white">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain p-3 transition group-hover:scale-[1.03]"
            fallbackClassName="grid h-full w-full place-items-center text-[var(--packora-orange)]"
          />
        </div>

        <div className="border-t border-[#F3F4F6] p-3">
          <p className="line-clamp-1 text-[11px] font-semibold text-[var(--packora-orange)]">
            {product.category}
          </p>

          <h2 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[#111827]">
            {product.name}
          </h2>

          <div className="mt-2 flex items-center justify-between gap-2">
            <Price
              amount={product.price}
              className="text-sm font-semibold text-[var(--packora-blue)]"
            />

            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--packora-blue)] text-white">
              <Plus size={17} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
