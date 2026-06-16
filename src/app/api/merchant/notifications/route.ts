import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { AUTH_ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireRole(AUTH_ROLES.merchant);

  const notifications = await prisma.merchantNotification.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      readAt: true,
      createdAt: true,
      orderId: true,
    },
  });

  return NextResponse.json({ notifications });
}

export async function PATCH(req: Request) {
  const user = await requireRole(AUTH_ROLES.merchant);
  const body = (await req.json()) as { notificationId?: string };

  if (!body.notificationId) {
    return NextResponse.json(
      { error: "notificationId is required." },
      { status: 400 }
    );
  }

  const result = await prisma.merchantNotification.updateMany({
    where: {
      id: body.notificationId,
      userId: user.id,
    },
    data: {
      readAt: new Date(),
    },
  });

  if (result.count === 0) {
    return NextResponse.json(
      { error: "Notification not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
