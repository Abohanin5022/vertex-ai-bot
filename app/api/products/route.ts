import { getProducts } from "@/lib/products";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ products, persisted: true });
  } catch {
    const products = await getProducts();

    return NextResponse.json({ products, persisted: false });
  }
}

export { POST } from "@/src/app/api/products/route";
