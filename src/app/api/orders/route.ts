import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateOrderProfitability } from "@/lib/profitability";

type OrderItemPayload = {
  id?: string;
  productId?: string;
  name: string;
  quantity: number;
  price: number;
};

type OrderPayload = {
  customer?: string;
  phone?: string;
  city?: string;
  address?: string;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentId?: string;
  paymentProvider?: string;
  paymentAmount?: number;
  paymentRaw?: unknown;
  paidAt?: string;
  status?: string;
  bankTransferReceipt?: string;
  paymentProofStatus?: string;
  couponCode?: string | null;
  discountAmount?: number;
  subtotal?: number;
  finalTotal?: number;
  shippingMethod?: string;
  shippingProvider?: string;
  shippingCost?: number;
  shippingEta?: string;
  shippingNotes?: string;
  items: OrderItemPayload[];
};

export async function POST(req: Request) {
  const body = (await req.json()) as OrderPayload;

  if (!body.items?.length) {
    return NextResponse.json(
      { error: "لا يمكن إنشاء طلب بدون منتجات." },
      { status: 400 }
    );
  }

  const paymentStatus = body.paymentStatus || "unpaid";
  const paymentId = body.paymentId || null;
  const paymentMethod = body.paymentMethod || "cod";
  const isBankTransfer = paymentMethod === "bank_transfer";
  const requestedFinalTotal = Number(body.finalTotal ?? body.total);
  const shippingCost = Number(body.shippingCost || 0);
  const discountAmount = Math.max(Number(body.discountAmount || 0), 0);
  const couponCode =
    typeof body.couponCode === "string" && body.couponCode.trim()
      ? body.couponCode.trim().toUpperCase()
      : null;

  if (isBankTransfer && !body.bankTransferReceipt) {
    return NextResponse.json(
      { error: "Bank transfer receipt is required." },
      { status: 400 }
    );
  }

  const profitability = await calculateOrderProfitability(
    body.items,
    Number.isFinite(requestedFinalTotal) ? requestedFinalTotal : Number(body.total)
  );
  const subtotal = Number.isFinite(Number(body.subtotal))
    ? Number(body.subtotal)
    : profitability.subtotal;
  const finalTotal = Number.isFinite(requestedFinalTotal)
    ? requestedFinalTotal
    : profitability.total;
  const productIds = Array.from(
    new Set(
      body.items
        .map((item) => item.productId || item.id)
        .filter((id): id is string => Boolean(id))
    )
  );

  try {
    const merchantIds = productIds.length
      ? Array.from(
          new Set(
            (
              await prisma.product.findMany({
                where: {
                  id: {
                    in: productIds,
                  },
                },
                select: {
                  userId: true,
                },
              })
            ).map((product) => product.userId)
          )
        )
      : [];

    const order = await prisma.order.create({
      data: {
        customer: body.customer || "عميل",
        phone: body.phone || "",
        city: body.city || "",
        address: body.address || "",
        subtotal,
        total: finalTotal,
        finalTotal,
        couponCode,
        discountAmount,
        commission: profitability.commission,
        merchantNet: profitability.merchantNet,
        platformRevenue: profitability.platformRevenue,
        status: isBankTransfer
          ? "bank_transfer_review"
          : body.status || "pending",
        paymentMethod,
        paymentStatus,
        paymentId,
        bankTransferReceipt: isBankTransfer
          ? body.bankTransferReceipt || null
          : null,
        paymentProofStatus: isBankTransfer
          ? body.paymentProofStatus || "pending"
          : null,
        shippingMethod: body.shippingMethod || null,
        shippingProvider: body.shippingProvider || null,
        shippingCost,
        shippingEta: body.shippingEta || null,
        shippingNotes: body.shippingNotes || null,
        paidAt: body.paidAt
          ? new Date(body.paidAt)
          : paymentStatus === "paid"
            ? new Date()
            : null,
        items: {
          create: body.items.map((item) => ({
            productId: item.productId || item.id || null,
            name: item.name,
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
        },
        payments: paymentId
          ? {
              create: {
                provider: body.paymentProvider || "manual",
                paymentId,
                amount: body.paymentAmount ?? profitability.total,
                currency: "SAR",
                status: paymentStatus,
                raw:
                  body.paymentRaw && typeof body.paymentRaw === "object"
                    ? body.paymentRaw
                    : undefined,
              },
            }
          : undefined,
      },
      include: {
        items: true,
        payments: true,
      },
    });

    const notificationData = merchantIds.flatMap((userId) => {
      const notifications = [
        {
          userId,
          orderId: order.id,
          type: "new_order",
          title: "طلب جديد",
          message: `وصلك طلب جديد من العميل ${order.customer}`,
        },
      ];

      if (isBankTransfer) {
        notifications.push({
          userId,
          orderId: order.id,
          type: "bank_transfer_review",
          title: "طلب تحويل بنكي يحتاج مراجعة",
          message: "العميل رفع إيصال تحويل لطلب جديد",
        });
      }

      return notifications;
    });

    if (notificationData.length) {
      await Promise.all(
        notificationData.map((notification) =>
          prisma.merchantNotification.create({
            data: notification,
          })
        )
      );
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      {
        error:
          "تعذر إنشاء الطلب حاليًا. تحقق من اتصال قاعدة البيانات وتطبيق Prisma migrations.",
      },
      { status: 503 }
    );
  }
}
