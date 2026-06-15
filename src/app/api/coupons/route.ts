import { getUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type CouponPayload = {
  code?: string;
  discount?: number;
};

export async function GET() {
  const coupons = await prisma.coupon.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  const user = await getUser();

  if (!user || (user.role !== "merchant" && user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as CouponPayload;
  const code = String(body.code || "").trim().toUpperCase();
  const discount = Number(body.discount);

  if (!code || !Number.isFinite(discount) || discount <= 0) {
    return NextResponse.json(
      { error: "بيانات الكوبون غير صحيحة" },
      { status: 400 }
    );
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      discount,
    },
  });

  return NextResponse.json(coupon);
}
