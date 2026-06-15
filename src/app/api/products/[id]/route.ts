import { NextResponse } from "next/server";
import { getMerchantUser } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

type ProductUpdatePayload = {
  name?: string;
  category?: string;
  price?: number;
  stock?: number;
  image?: string | null;
  description?: string | null;
  isActive?: boolean;
  compareAtPrice?: number | null;
  minOrderQuantity?: number;
  isFeatured?: boolean;
  weight?: number | null;
  dimensions?: string | null;
};

function optionalText(value: unknown) {
  const text = String(value || "").trim();
  return text || null;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getMerchantUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await req.json()) as ProductUpdatePayload;

  const product = await prisma.product.findFirst({
    where: {
      id,
      userId: user.id,
      deletedAt: null,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const data: ProductUpdatePayload = {};

  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.category !== undefined) data.category = String(body.category).trim();
  if (body.price !== undefined) data.price = Number(body.price);
  if (body.stock !== undefined) data.stock = Number(body.stock);
  if (body.compareAtPrice !== undefined) {
    data.compareAtPrice =
      body.compareAtPrice === null ? null : Number(body.compareAtPrice);
  }
  if (body.minOrderQuantity !== undefined) {
    data.minOrderQuantity = Number(body.minOrderQuantity);
  }
  if (body.weight !== undefined) {
    data.weight = body.weight === null ? null : Number(body.weight);
  }
  if (body.dimensions !== undefined) {
    data.dimensions = optionalText(body.dimensions);
  }
  if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured);
  if (body.image !== undefined) {
    data.image = optionalText(body.image);
  }
  if (body.description !== undefined) {
    data.description = optionalText(body.description);
  }
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  if (data.name !== undefined && !data.name) {
    return NextResponse.json(
      { error: "Product name is required" },
      { status: 400 }
    );
  }

  if (data.category !== undefined && !data.category) {
    return NextResponse.json(
      { error: "Product category is required" },
      { status: 400 }
    );
  }

  if (
    data.price !== undefined &&
    (!Number.isFinite(data.price) || data.price < 0)
  ) {
    return NextResponse.json(
      { error: "Invalid product price" },
      { status: 400 }
    );
  }

  if (
    data.stock !== undefined &&
    (!Number.isFinite(data.stock) ||
      data.stock < 0 ||
      !Number.isInteger(data.stock))
  ) {
    return NextResponse.json(
      { error: "Invalid product stock" },
      { status: 400 }
    );
  }

  if (
    data.compareAtPrice !== undefined &&
    data.compareAtPrice !== null &&
    (!Number.isFinite(data.compareAtPrice) || data.compareAtPrice < 0)
  ) {
    return NextResponse.json(
      { error: "Invalid compare at price" },
      { status: 400 }
    );
  }

  if (
    data.minOrderQuantity !== undefined &&
    (!Number.isFinite(data.minOrderQuantity) ||
      data.minOrderQuantity < 1 ||
      !Number.isInteger(data.minOrderQuantity))
  ) {
    return NextResponse.json(
      { error: "Invalid minimum order quantity" },
      { status: 400 }
    );
  }

  if (
    data.weight !== undefined &&
    data.weight !== null &&
    (!Number.isFinite(data.weight) || data.weight < 0)
  ) {
    return NextResponse.json(
      { error: "Invalid product weight" },
      { status: 400 }
    );
  }

  const updated = await prisma.product.update({
    where: {
      id,
    },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getMerchantUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const product = await prisma.product.findFirst({
    where: {
      id,
      userId: user.id,
      deletedAt: null,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await prisma.product.update({
    where: {
      id,
    },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
