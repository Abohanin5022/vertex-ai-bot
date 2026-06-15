import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type OrderItemPayload = {
  id?: string;
  productId?: string;
  name: string;
  quantity: number;
  price: number;
};

type VerifyPayload = {
  paymentId?: string;
    order?: {
      customer?: string;
      phone?: string;
      city?: string;
      address?: string;
      total?: number;
      shippingMethod?: string;
      shippingProvider?: string;
      shippingCost?: number;
      shippingEta?: string;
      shippingNotes?: string;
      items?: OrderItemPayload[];
    };
};

type MoyasarPayment = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  created_at?: string;
  source?: {
    type?: string;
    company?: string;
    name?: string;
    number?: string;
  };
};

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const payload = (await req.json()) as VerifyPayload;
  const paymentId = String(payload.paymentId || "").trim();
  const orderPayload = payload.order;

  if (!paymentId || !orderPayload?.items?.length || !orderPayload.total) {
    return NextResponse.json(
      { error: "بيانات الدفع أو الطلب غير مكتملة" },
      { status: 400 }
    );
  }

  const existingPayment = await prisma.payment
    .findUnique({
      where: {
        paymentId,
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    })
    .catch(() => null);

  if (existingPayment?.order) {
    return NextResponse.json({
      success: true,
      order: existingPayment.order,
      payment: existingPayment,
    });
  }

  let payment: MoyasarPayment;

  try {
    payment = await fetchMoyasarPayment(paymentId);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "تعذر التحقق من عملية الدفع لدى Moyasar",
      },
      { status: 502 }
    );
  }

  const expectedAmount = Math.round(Number(orderPayload.total) * 100);

  if (payment.status !== "paid") {
    await logFailedPayment(payment, orderPayload.total);

    return NextResponse.json(
      {
        error: "لم تكتمل عملية الدفع. لم يتم إنشاء الطلب.",
        paymentStatus: payment.status,
      },
      { status: 400 }
    );
  }

  if (payment.currency !== "SAR" || payment.amount !== expectedAmount) {
    await logFailedPayment(payment, orderPayload.total);

    return NextResponse.json(
      {
        error: "بيانات الدفع لا تطابق إجمالي الطلب. لم يتم إنشاء الطلب.",
      },
      { status: 400 }
    );
  }

  try {
    const createdOrder = await prisma.order.create({
      data: {
        customer: orderPayload.customer || "عميل",
        phone: orderPayload.phone || "",
        city: orderPayload.city || "",
        address: orderPayload.address || "",
        total: Number(orderPayload.total),
        paymentMethod: "moyasar",
        paymentStatus: "paid",
        paymentId: payment.id,
        shippingMethod: orderPayload.shippingMethod || null,
        shippingProvider: orderPayload.shippingProvider || null,
        shippingCost: Number(orderPayload.shippingCost || 0),
        shippingEta: orderPayload.shippingEta || null,
        shippingNotes: orderPayload.shippingNotes || null,
        paidAt: payment.created_at ? new Date(payment.created_at) : new Date(),
        items: {
          create: orderPayload.items.map((item) => ({
            productId: item.productId || item.id || null,
            name: item.name,
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await prisma.payment.upsert({
      where: {
        paymentId: payment.id,
      },
      create: {
        orderId: createdOrder.id,
        provider: "moyasar",
        paymentId: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        raw: payment,
      },
      update: {
        orderId: createdOrder.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        raw: payment,
      },
    });

    const order = await prisma.order.findUniqueOrThrow({
      where: {
        id: createdOrder.id,
      },
      include: {
        items: true,
        payments: true,
      },
    });

    return NextResponse.json({
      success: true,
      order,
      payment,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "تم التحقق من الدفع لكن تعذر حفظ الطلب. تحقق من اتصال قاعدة البيانات وتطبيق Prisma migrations.",
      },
      { status: 503 }
    );
  }
}

async function fetchMoyasarPayment(paymentId: string) {
  const secret = process.env.MOYASAR_SECRET_KEY;

  if (!secret) {
    throw new Error("MOYASAR_SECRET_KEY is required to verify payments.");
  }

  const response = await fetch(
    `https://api.moyasar.com/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${secret}:`).toString("base64")}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("تعذر التحقق من عملية الدفع لدى Moyasar");
  }

  return (await response.json()) as MoyasarPayment;
}

async function logFailedPayment(payment: MoyasarPayment, fallbackAmount: number) {
  try {
    await prisma.payment.upsert({
      where: {
        paymentId: payment.id,
      },
      create: {
        provider: "moyasar",
        paymentId: payment.id,
        amount: payment.amount ? payment.amount / 100 : fallbackAmount,
        currency: payment.currency || "SAR",
        status: payment.status || "failed",
        raw: payment,
      },
      update: {
        amount: payment.amount ? payment.amount / 100 : fallbackAmount,
        currency: payment.currency || "SAR",
        status: payment.status || "failed",
        raw: payment,
      },
    });
  } catch {
    // Failed payment logging should not hide the actual payment result.
  }
}
