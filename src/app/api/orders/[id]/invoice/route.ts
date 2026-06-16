import { generateInvoice } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const normalizedId = decodeURIComponent(id).trim();
  const order = await findOrder(normalizedId);

  if (!order) {
    return Response.json(
      {
        error: "Order not found",
        message:
          "استخدم رقم الطلب الحقيقي من صفحة الطلبات أو صفحة التتبع، وليس رقمًا تجريبيًا مثل 1.",
      },
      {
        status: 404,
      }
    );
  }

  const pdf = await generateInvoice(order);
  const filename = `packora-invoice-${order.id.slice(0, 8)}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function getOrderInclude() {
  return {
    items: true,
  } as const;
}

async function findOrder(id: string) {
  const include = getOrderInclude();
  const exactOrder = await prisma.order.findUnique({
    where: {
      id,
    },
    include,
  });

  if (exactOrder) {
    return exactOrder;
  }

  if (id.length >= 4) {
    return prisma.order.findFirst({
      where: {
        id: {
          startsWith: id,
        },
      },
      include,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  return null;
}
