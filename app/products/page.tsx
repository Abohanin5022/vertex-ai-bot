import { getProducts } from "@/lib/products";
import { hasSupabaseConfig } from "@/lib/supabase";
import { ProductWorkspace } from "@/components/product-workspace";
import { PerforatedDivider } from "@/components/ui/perforated-divider";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <header className="pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-tape-deep">
          قائمة الجرد
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-normal">
          المنتجات والمخزون
        </h2>
      </header>
      <PerforatedDivider />
      <div className="mt-6">
        <ProductWorkspace
          products={products}
          isSupabaseConfigured={hasSupabaseConfig()}
        />
      </div>
    </div>
  );
}
