import Link from "next/link";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { MerchantProductActions } from "@/components/merchant-product-actions";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";

export default async function MerchantProductsPage() {
  await connection();

  const user = await requireRole("merchant");
  const products = await prisma.product.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  const lowStockCount = products.filter((product) => product.stock < 10).length;
  const criticalStockCount = products.filter(
    (product) => product.stock < 5
  ).length;
  const activeCount = products.filter((product) => product.isActive).length;

  return (
    <main className="min-h-screen bg-[var(--packora-cyan-soft)] p-4">
      <section className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-[28px] border border-[var(--packora-border)] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--packora-blue)]">
                Packora 2 Products
              </p>

              <h1 className="mt-3 text-4xl font-black text-[var(--packora-navy)]">
                إدارة المنتجات والمخزون
              </h1>

              <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                تحكم في المنتجات، المخزون، التميز، التوفر، والظهور داخل المتجر.
              </p>
            </div>

            <Link
              href="/packora-2/products/new"
              className="rounded-full bg-[var(--packora-blue)] px-5 py-3 text-sm font-semibold text-white"
            >
              إضافة منتج
            </Link>
          </div>
        </header>

        <section className="mb-5 grid gap-3 sm:grid-cols-4">
          <StockSummaryCard label="كل المنتجات" value={products.length} />
          <StockSummaryCard label="منتجات متاحة" value={activeCount} />
          <StockSummaryCard
            label="مخزون منخفض"
            value={lowStockCount}
            tone="orange"
          />
          <StockSummaryCard
            label="نفاد قريب"
            value={criticalStockCount}
            tone="red"
          />
        </section>

        <section className="rounded-[28px] border border-[var(--packora-border)] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--packora-border)] p-5">
            <div>
              <h2 className="text-2xl font-black text-[var(--packora-navy)]">
                جدول المنتجات
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                تعديل، تعطيل، نسخ، إخفاء، أو معاينة المنتج من مكان واحد.
              </p>
            </div>

            <span className="rounded-full bg-[var(--packora-cyan)] px-4 py-2 text-sm font-semibold text-[var(--packora-blue)]">
              {products.length} منتج
            </span>
          </div>

          {products.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-2xl font-semibold text-[var(--packora-navy)]">
                لا توجد منتجات حاليًا
              </h3>

              <p className="mt-2 text-sm text-[#6B7280]">
                ابدأ بإضافة أول منتج حقيقي في متجر Packora 2.
              </p>

              <Link
                href="/packora-2/products/new"
                className="mt-6 inline-block rounded-full bg-[var(--packora-navy)] px-6 py-4 font-semibold text-white"
              >
                إضافة منتج جديد
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1320px] text-right">
                <thead className="bg-[var(--packora-cyan-soft)] text-sm text-[#64748B]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">الصورة</th>
                    <th className="px-5 py-4 font-semibold">المنتج</th>
                    <th className="px-5 py-4 font-semibold">التصنيف</th>
                    <th className="px-5 py-4 font-semibold">السعر</th>
                    <th className="px-5 py-4 font-semibold">قبل الخصم</th>
                    <th className="px-5 py-4 font-semibold">المخزون</th>
                    <th className="px-5 py-4 font-semibold">أقل كمية</th>
                    <th className="px-5 py-4 font-semibold">التميز</th>
                    <th className="px-5 py-4 font-semibold">الحالة</th>
                    <th className="px-5 py-4 font-semibold">تنبيه</th>
                    <th className="px-5 py-4 font-semibold">الإجراءات</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--packora-border)]">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className={`align-middle ${rowClassName(product.stock)}`}
                    >
                      <td className="px-5 py-4">
                        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border border-[var(--packora-border)] bg-white">
                          <ProductImage
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-contain p-3"
                            fallbackClassName="grid h-full w-full place-items-center text-xs font-semibold text-[#6B7280]"
                          />
                        </div>
                      </td>

                      <td className="max-w-[280px] px-5 py-4">
                        <h3 className="line-clamp-2 font-semibold text-[var(--packora-navy)]">
                          {product.name}
                        </h3>

                        {product.description ? (
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#64748B]">
                            {product.description}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-[#94A3B8]">
                            لا يوجد وصف
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-[var(--packora-cyan)] px-3 py-1 text-xs font-semibold text-[var(--packora-blue)]">
                          {product.category}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <Price
                          amount={product.price}
                          className="text-base font-semibold text-[var(--packora-navy)]"
                        />
                      </td>

                      <td className="px-5 py-4">
                        {product.compareAtPrice ? (
                          <Price
                            amount={product.compareAtPrice}
                            className="text-sm font-semibold text-[#94A3B8] line-through"
                          />
                        ) : (
                          <span className="text-sm text-[#94A3B8]">-</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className={stockValueClassName(product.stock)}>
                          {product.stock}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-[var(--packora-navy)]">
                          {product.minOrderQuantity}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <Badge active={product.isFeatured}>
                          {product.isFeatured ? "مميز" : "غير مميز"}
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        <Badge active={product.isActive && product.stock > 0}>
                          {product.isActive && product.stock > 0
                            ? "متوفر"
                            : "غير متوفر"}
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        <StockWarning
                          productId={product.id}
                          stock={product.stock}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="w-[300px]">
                          <MerchantProductActions
                            product={product}
                            storeSlug={user.storeSlug}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function rowClassName(stock: number) {
  if (stock < 5) {
    return "bg-red-50/45";
  }

  if (stock < 10) {
    return "bg-orange-50/45";
  }

  return "";
}

function stockValueClassName(stock: number) {
  if (stock < 5) {
    return "font-black text-red-700";
  }

  if (stock < 10) {
    return "font-black text-orange-700";
  }

  return "font-semibold text-[var(--packora-navy)]";
}

function Badge({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {children}
    </span>
  );
}

function StockWarning({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  if (stock === 0) {
    return (
      <Link
        href={`/packora-2/products/${productId}/edit`}
        className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-700"
      >
        <AlertTriangle size={14} />
        نفد المنتج
      </Link>
    );
  }

  if (stock < 5) {
    return (
      <Link
        href={`/packora-2/products/${productId}/edit`}
        className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-700"
      >
        <AlertTriangle size={14} />
        نفاد المخزون قريبًا
      </Link>
    );
  }

  if (stock < 10) {
    return (
      <Link
        href={`/packora-2/products/${productId}/edit`}
        className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-xs font-black text-orange-700"
      >
        <AlertTriangle size={14} />
        مخزون منخفض
      </Link>
    );
  }

  return <span className="text-sm text-[#94A3B8]">مستقر</span>;
}

function StockSummaryCard({
  label,
  value,
  tone = "blue",
}: {
  label: string;
  value: number;
  tone?: "blue" | "orange" | "red";
}) {
  const toneClass =
    tone === "red"
      ? "border-red-200 bg-red-50 text-red-700"
      : tone === "orange"
        ? "border-orange-200 bg-orange-50 text-orange-700"
        : "border-[var(--packora-border)] bg-white text-[var(--packora-blue)]";

  return (
    <article className={`rounded-[24px] border p-5 ${toneClass}`}>
      <p className="text-sm font-semibold">{label}</p>
      <strong className="mt-2 block text-3xl font-black">{value}</strong>
    </article>
  );
}
