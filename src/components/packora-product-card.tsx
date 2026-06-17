import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { type FavoriteProduct } from "@/store/favorites-store";

export function PackoraProductCard({ product }: { product: FavoriteProduct }) {
  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-[var(--packora-border)] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(236,72,153,0.10)]">
      <div className="absolute left-2 top-2 z-10">
        <FavoriteButton product={product} />
      </div>

      <Link href={`/packora-1/products/${product.id}`} className="block">
        <div className="grid h-36 place-items-center bg-white sm:h-40">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain p-3 transition group-hover:scale-[1.03]"
            fallbackClassName="grid h-20 w-20 place-items-center rounded-2xl border border-[var(--packora-border)] bg-[var(--packora-soft-pink)] text-4xl"
          />
        </div>

        <div className="border-t border-[var(--packora-border)] p-3">
          <p className="line-clamp-1 text-[11px] font-semibold text-[var(--packora-blue)]">
            {product.category}
          </p>

          <h2 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[var(--packora-navy)]">
            {product.name}
          </h2>

          <div className="mt-2 flex items-center justify-between gap-2">
            <Price
              amount={product.price}
              className="text-sm font-semibold text-[var(--packora-blue)]"
            />
            <span className="rounded-full bg-[var(--packora-light-pink)] px-2 py-1 text-[10px] font-semibold text-[var(--packora-muted)]">
              متوفر
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
