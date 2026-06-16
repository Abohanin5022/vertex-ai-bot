import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PaymentProofPayload = {
  bankTransferReceipt?: string;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as PaymentProofPayload;
  const bankTransferReceipt = String(body.bankTransferReceipt || "").trim();

  if (!bankTransferReceipt) {
    return NextResponse.json(
      { error: "رابط إيصال التحويل مطلوب." },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      paymentMethod: true,
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "الطلب غير موجود." },
      { status: 404 }
    );
  }

  if (order.paymentMethod !== "bank_transfer") {
    return NextResponse.json(
      { error: "لا يمكن رفع إيصال إلا لطلبات التحويل البنكي." },
      { status: 400 }
    );
  }

  const updatedOrder = await prisma.order.update({
    where: {
      id,
    },
    data: {
      bankTransferReceipt,
      paymentProofStatus: "pending",
      paymentStatus: "manual_review",
      status: "bank_transfer_review",
      paidAt: null,
    },
  });

  return NextResponse.json(updatedOrder);
}
