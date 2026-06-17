import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/favorite-button";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { type FavoriteProduct } from "@/store/favorites-store";

export function PackoraProductCard({ product }: { product: FavoriteProduct }) {
  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-[var(--packora-border)] bg-white shadow-[0_10px_24px_rgba(236,72,153,0.05)] transition hover:-translate-y-0.5 hover:border-[var(--packora-baby-pink)] hover:shadow-[0_18px_36px_rgba(236,72,153,0.12)]">
      <div className="absolute left-3 top-3 z-10">
        <FavoriteButton product={product} />
      </div>

      <Link href={`/packora-1/products/${product.id}`} className="block">
        <div className="grid h-44 place-items-center bg-[linear-gradient(180deg,#FFFFFF,#FDF2F8)] sm:h-48">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.04]"
            fallbackClassName="grid h-20 w-20 place-items-center rounded-2xl border border-[var(--packora-border)] bg-[var(--packora-soft-pink)] text-4xl"
          />
        </div>
      </Link>

      <div className="border-t border-[var(--packora-border)] p-3.5">
        <Link href={`/packora-1/products/${product.id}`} className="block">
          <p className="line-clamp-1 text-[11px] font-semibold text-[var(--packora-blue)]">
            {product.category || "منتج"}
          </p>

          <h2 className="mt-1.5 line-clamp-2 min-h-11 text-sm font-bold leading-5 text-[var(--packora-navy)] sm:text-[15px]">
            {product.name}
          </h2>
        </Link>

        <div className="mt-3 flex items-center justify-between gap-2">
          <Price
            amount={product.price}
            className="text-base font-black text-[var(--packora-blue)]"
          />
          <span className="rounded-full bg-[var(--packora-light-pink)] px-2 py-1 text-[10px] font-semibold text-[var(--packora-muted)]">
            متوفر
          </span>
        </div>

        <AddToCartButton
          id={product.id}
          name={product.name}
          category={product.category}
          image={product.image}
          price={product.price}
          quantity={1}
          className="mt-3 w-full rounded-2xl bg-[var(--packora-blue)] py-2.5 text-center text-xs font-black text-white shadow-[0_10px_22px_rgba(236,72,153,0.22)] transition hover:bg-[var(--packora-blue-dark)]"
        />
      </div>
    </article>
  );
}
