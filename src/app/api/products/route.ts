import { prisma } from "@/lib/prisma";
import { getMerchantUser } from "@/lib/merchant-auth";
import { NextResponse } from "next/server";

type ProductPayload = {
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
  compareAtPrice?: number | null;
  minOrderQuantity?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  weight?: number | null;
  dimensions?: string | null;
};

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function optionalText(value: unknown) {
  const text = cleanText(value);
  return text || null;
}

function numberValue(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function integerValue(value: unknown, fallback = 0) {
  const number = numberValue(value, fallback);
  return Number.isInteger(number) ? number : Math.trunc(number);
}

export async function POST(req: Request) {
  const user = await getMerchantUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = (await req.json()) as ProductPayload;
  const name = cleanText(body.name);
  const category = cleanText(body.category);
  const price = Math.max(0, numberValue(body.price));
  const stock = Math.max(0, integerValue(body.stock));

  if (!name || !category) {
    return NextResponse.json(
      { error: "اسم المنتج والتصنيف مطلوبان" },
      { status: 400 }
    );
  }

  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json(
      { error: "سعر المنتج غير صحيح" },
      { status: 400 }
    );
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return NextResponse.json(
      { error: "المخزون غير صحيح" },
      { status: 400 }
    );
  }

  const productsCount = await prisma.product.count({
    where: {
      userId: user.id,
      deletedAt: null,
    },
  });

  if (productsCount >= user.productLimit) {
    return NextResponse.json(
      {
        error:
          "وصلت إلى الحد الأعلى للمنتجات في باقتك الحالية. يرجى ترقية الباقة.",
      },
      { status: 403 }
    );
  }

  const product = await prisma.product.create({
    data: {
      name,
      category,
      price,
      compareAtPrice:
        body.compareAtPrice === undefined || body.compareAtPrice === null
          ? null
          : Math.max(0, numberValue(body.compareAtPrice)),
      stock,
      minOrderQuantity: Math.max(1, integerValue(body.minOrderQuantity, 1)),
      image: optionalText(body.image),
      description: optionalText(body.description),
      isActive: body.isActive !== false,
      isFeatured: body.isFeatured === true,
      weight:
        body.weight === undefined || body.weight === null
          ? null
          : Math.max(0, numberValue(body.weight)),
      dimensions: optionalText(body.dimensions),
      userId: user.id,
    },
  });

  return NextResponse.json(product);
}
