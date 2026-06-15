import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = String(searchParams.get("code") || "").trim().toUpperCase();

  if (!code) {
    return NextResponse.json({
      valid: false,
    });
  }

  const coupon = await prisma.coupon.findUnique({
    where: {
      code,
    },
  });

  if (!coupon || !coupon.active) {
    return NextResponse.json({
      valid: false,
    });
  }

  return NextResponse.json({
    valid: true,
    discount: coupon.discount,
  });
}
