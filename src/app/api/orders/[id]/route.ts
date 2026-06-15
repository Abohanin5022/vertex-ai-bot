import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";

const statusLabels: Record<string, string> = {
  bank_transfer_review: "بانتظار مراجعة التحويل",
  pending: "جديد",
  processing: "قيد التجهيز",
  shipped: "جاهز للشحن",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const allowedStatuses = Object.keys(statusLabels);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = (await req.json()) as {
    status?: string;
    paymentProofStatus?: "accepted" | "rejected";
  };
  const { id } = await params;

  if (body.paymentProofStatus === "accepted") {
    const order = await prisma.order.update({
      where: {
        id,
      },
      data: {
        paymentProofStatus: "accepted",
        paymentStatus: "paid",
        paidAt: new Date(),
      },
    });

    return NextResponse.json(order);
  }

  if (body.paymentProofStatus === "rejected") {
    const order = await prisma.order.update({
      where: {
        id,
      },
      data: {
        paymentProofStatus: "rejected",
        paymentStatus: "unpaid",
        status: "pending",
        paidAt: null,
      },
    });

    return NextResponse.json(order);
  }

  const status = String(body.status || "");

  if (!allowedStatuses.includes(status)) {
    return NextResponse.json(
      { error: "Invalid order status" },
      { status: 400 }
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

  try {
    await sendWhatsApp(
      order.phone,
      `تم تحديث حالة طلبك في Packora إلى: ${statusLabels[status]}`
    );
  } catch {
    // WhatsApp notifications are best-effort and should not block order updates.
  }

  return NextResponse.json(order);
}
