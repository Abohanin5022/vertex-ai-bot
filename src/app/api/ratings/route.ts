import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RatingPayload = {
  orderId?: string;
  productId?: string;
  storeId?: string;
  rating?: number;
  comment?: string;
};

async function updateProductAverage(productId: string) {
  const aggregate = await prisma.productRating.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: aggregate._avg.rating || 0,
      ratingCount: aggregate._count.rating,
    },
  });
}

async function updateStoreAverage(userId: string) {
  const aggregate = await prisma.storeRating.aggregate({
    where: { userId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      storeRating: aggregate._avg.rating || 0,
      storeRatingCount: aggregate._count.rating,
    },
  });
}

export async function POST(req: Request) {
  const body = (await req.json()) as RatingPayload;
  const rating = Number(body.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  if (!body.orderId) {
    return NextResponse.json(
      { error: "Order is required for rating" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: body.orderId },
    include: { items: true },
  });

  if (!order || order.status !== "completed") {
    return NextResponse.json(
      { error: "Only completed orders can be rated" },
      { status: 400 }
    );
  }

  let storeId = body.storeId || "";

  if (body.productId) {
    const orderedProduct = order.items.some(
      (item) => item.productId === body.productId
    );

    if (!orderedProduct) {
      return NextResponse.json(
        { error: "Product is not part of this order" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: body.productId },
      select: { id: true, userId: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    storeId = product.userId;

    await prisma.productRating.create({
      data: {
        productId: product.id,
        orderId: order.id,
        rating,
        comment: body.comment ? String(body.comment) : null,
      },
    });

    await updateProductAverage(product.id);
  }

  if (storeId) {
    await prisma.storeRating.create({
      data: {
        userId: storeId,
        orderId: order.id,
        rating,
        comment: body.comment ? String(body.comment) : null,
      },
    });

    await updateStoreAverage(storeId);
  }

  return NextResponse.json({ success: true });
}
