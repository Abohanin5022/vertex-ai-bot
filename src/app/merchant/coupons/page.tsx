import Link from "next/link";
import { connection } from "next/server";
import { CouponsClient } from "./coupons-client";
import { LogoutButton } from "@/components/logout-button";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";

export default async function CouponsPage() {
  await connection();
  await requireRole("merchant");

  const coupons = await prisma.coupon.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main dir="rtl" className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-blue-600">لوحة التاجر</p>
            <h1 className="mt-1 text-4xl font-black">الكوبونات والعروض</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/packora-2"
              className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-blue-50"
            >
              لوحة التاجر
            </Link>

            <LogoutButton redirectTo="/packora-2/login" />
          </div>
        </div>

        <CouponsClient initialCoupons={coupons} />
      </div>
    </main>
  );
}
