import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { AUTH_ROLES } from "@/lib/roles";

type PaymentProofAction = {
  action?: "approve" | "reject";
};

async function merchantOwnsOrder(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      items: {
        select: {
          productId: true,
        },
      },
    },
  });

  const productIds = Array.from(
    new Set(
      (order?.items || [])
        .map((item) => item.productId)
        .filter((productId): productId is string => Boolean(productId))
    )
  );

  if (!productIds.length) {
    return false;
  }

  const product = await prisma.product.findFirst({
    where: {
      id: {
        in: productIds,
      },
      userId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(product);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(AUTH_ROLES.merchant);
  const { id } = await params;
  const body = (await req.json()) as PaymentProofAction;

  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json(
      { error: "Invalid payment proof action." },
      { status: 400 }
    );
  }

  const canReview = await merchantOwnsOrder(id, user.id);

  if (!canReview) {
    return NextResponse.json(
      { error: "لا يمكنك تعديل طلب لا يخص متجرك." },
      { status: 403 }
    );
  }

  const isApprove = body.action === "approve";
  const order = await prisma.order.update({
    where: {
      id,
    },
    data: {
      paymentStatus: isApprove ? "paid" : "manual_review_rejected",
      paymentProofStatus: isApprove ? "approved" : "rejected",
      status: isApprove ? "confirmed" : "payment_rejected",
      paidAt: isApprove ? new Date() : null,
    },
  });

  await prisma.merchantNotification.create({
    data: {
      userId: user.id,
      orderId: order.id,
      type: isApprove
        ? "bank_transfer_approved"
        : "bank_transfer_rejected",
      title: isApprove ? "تم قبول التحويل البنكي" : "تم رفض التحويل البنكي",
      message: isApprove
        ? `تم قبول إيصال التحويل للطلب #${order.id.slice(0, 8)}`
        : `تم رفض إيصال التحويل للطلب #${order.id.slice(0, 8)}`,
    },
  });

  return NextResponse.json(order);
}
