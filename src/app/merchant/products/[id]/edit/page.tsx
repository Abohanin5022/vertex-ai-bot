import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ProductEditForm } from "@/components/product-edit-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const user = await requireRole("merchant");
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: {
      id,
      userId: user.id,
      deletedAt: null,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[var(--packora-cyan-soft)] p-4">
      <section className="mx-auto max-w-2xl">
        <header className="mb-5 rounded-[28px] border border-[var(--packora-border)] bg-white p-6">
          <Link
            href="/packora-2/products"
            className="inline-flex rounded-full border border-[var(--packora-border)] px-4 py-2 text-sm font-semibold text-[var(--packora-navy)]"
          >
            رجوع
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--packora-blue)]">
            Merchant Dashboard
          </p>

          <h1 className="mt-3 text-4xl font-semibold text-[var(--packora-navy)]">
            تعديل المنتج
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            عدّل بيانات المنتج والصورة والحالة من مكان واحد.
          </p>
        </header>

        <ProductEditForm product={product} />
      </section>
    </main>
  );
}
