import type { ReactNode } from "react";
import { connection } from "next/server";
import { LogoutButton } from "@/components/logout-button";
import { Price } from "@/components/price";
import { RevenueChart } from "@/components/revenue-chart";
import { getUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  await connection();

  const user = await getUser();
  const products = user
    ? await prisma.product.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          name: true,
        },
      })
    : [];

  const productIds = products.map((product) => product.id);
  const productNames = products.map((product) => product.name);
  const itemFilter =
    productIds.length > 0
      ? {
          OR: [
            {
              productId: {
                in: productIds,
              },
            },
            {
              productId: null,
              name: {
                in: productNames,
              },
            },
          ],
        }
      : {
          productId: "__no_vendor_products__",
        };

  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: itemFilter,
      },
    },
    include: {
      items: {
        where: itemFilter,
      },
    },
  });

  const revenue = orders.reduce((sum, order) => {
    const vendorTotal = order.items.reduce(
      (itemSum, item) => itemSum + item.price * item.quantity,
      0
    );

    return sum + vendorTotal;
  }, 0);

  const average = orders.length > 0 ? revenue / orders.length : 0;
  const pending = orders.filter((order) => order.status === "pending").length;
  const shipped = orders.filter((order) => order.status === "shipped").length;

  return (
    <main dir="rtl" className="min-h-screen bg-[var(--packora-cyan-soft)] p-4">
      <section className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-[28px] border border-[var(--packora-border)] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--packora-blue)]">
                Merchant Analytics
              </p>

              <h1 className="mt-3 text-4xl font-semibold text-[var(--packora-navy)]">
                التحليلات والإحصائيات
              </h1>

              <p className="mt-2 text-sm text-[#6B7280]">
                أرقام خاصة بمنتجات متجرك وطلباتك فقط.
              </p>
            </div>

            <LogoutButton redirectTo="/packora-2/login" />
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card
            title="إجمالي الإيرادات"
            value={
              <Price
                amount={revenue}
                className="text-4xl font-semibold text-[var(--packora-navy)]"
                iconClassName="h-7 w-7"
              />
            }
          />

          <Card title="عدد الطلبات" value={orders.length} />

          <Card
            title="متوسط الطلب"
            value={
              <Price
                amount={average}
                className="text-4xl font-semibold text-[var(--packora-navy)]"
                iconClassName="h-7 w-7"
              />
            }
          />

          <Card title="طلبات مشحونة" value={shipped} />
        </div>

        <section className="mt-6 rounded-[28px] border border-[var(--packora-border)] bg-white p-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--packora-blue)]">
              Revenue
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[var(--packora-navy)]">
              أداء المبيعات
            </h2>
          </div>

          <RevenueChart />
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-[28px] border border-[var(--packora-border)] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[var(--packora-navy)]">
              حالة الطلبات
            </h2>

            <div className="mt-6 grid gap-4">
              <Status
                label="قيد الانتظار"
                value={pending}
                color="bg-amber-500"
              />

              <Status label="تم الشحن" value={shipped} color="bg-emerald-500" />
            </div>
          </section>

          <section className="rounded-[28px] border border-[var(--packora-border)] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[var(--packora-navy)]">
              أداء المتجر
            </h2>

            <div className="mt-6 rounded-[22px] border border-[var(--packora-border)] bg-[var(--packora-cyan-soft)] p-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--packora-navy)]">
                  معدل التحويل
                </span>

                <strong className="text-2xl font-semibold text-[var(--packora-blue)]">
                  4.8%
                </strong>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--packora-border)]">
                <div className="h-full w-[48%] rounded-full bg-[var(--packora-blue)]" />
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Card({ title, value }: { title: string; value: ReactNode }) {
  return (
    <article className="rounded-[28px] border border-[var(--packora-border)] bg-white p-6">
      <p className="text-sm font-semibold text-[#6B7280]">{title}</p>

      <h2 className="mt-4 text-4xl font-semibold text-[var(--packora-navy)]">
        {value}
      </h2>
    </article>
  );
}

function Status({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-[var(--packora-navy)]">{label}</span>

        <strong className="text-[var(--packora-navy)]">{value}</strong>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-[var(--packora-border)]">
        <div
          className={`h-full ${color}`}
          style={{
            width: `${Math.min(value * 10, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
