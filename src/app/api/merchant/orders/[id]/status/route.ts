import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { AUTH_ROLES } from "@/lib/roles";

const statusLabels: Record<string, string> = {
  confirmed: "مؤكد",
  preparing: "قيد التجهيز",
  shipped: "تم الشحن",
  completed: "مكتمل",
  cancelled: "ملغي",
};

type OrderStatusPayload = {
  status?: keyof typeof statusLabels;
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
  const body = (await req.json()) as OrderStatusPayload;
  const status = String(body.status || "") as keyof typeof statusLabels;

  if (!Object.prototype.hasOwnProperty.call(statusLabels, status)) {
    return NextResponse.json(
      { error: "Invalid order status." },
      { status: 400 }
    );
  }

  const canUpdate = await merchantOwnsOrder(id, user.id);

  if (!canUpdate) {
    return NextResponse.json(
      { error: "لا يمكنك تعديل طلب لا يخص متجرك." },
      { status: 403 }
    );
  }

  const order = await prisma.order.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  await prisma.merchantNotification.create({
    data: {
      userId: user.id,
      orderId: order.id,
      type: "order_status_updated",
      title: "تم تحديث حالة الطلب",
      message: `تم تغيير حالة الطلب #${order.id.slice(0, 8)} إلى ${statusLabels[status]}.`,
    },
  });

  return NextResponse.json(order);
}
