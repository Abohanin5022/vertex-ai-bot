import { NextResponse } from "next/server";
import { getUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";

type MonetizationPayload = {
  fixedCommission?: number;
  percentageCommission?: number;
  commissionEnabled?: boolean;
};

async function requireAdmin() {
  const user = await getUser();

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
}

export async function GET() {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [settings, plans] = await Promise.all([
    prisma.platformCommissionSetting.findUnique({
      where: { id: "platform" },
    }),
    prisma.subscriptionPlan.findMany({
      orderBy: { productLimit: "asc" },
    }),
  ]);

  return NextResponse.json({ settings, plans });
}

export async function PATCH(req: Request) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as MonetizationPayload;
  const fixedCommission = Math.max(0, Number(body.fixedCommission || 0));
  const percentageCommission = Math.max(
    0,
    Number(body.percentageCommission || 0)
  );

  const settings = await prisma.platformCommissionSetting.upsert({
    where: { id: "platform" },
    create: {
      id: "platform",
      fixedCommission,
      percentageCommission,
      commissionEnabled: Boolean(body.commissionEnabled),
    },
    update: {
      fixedCommission,
      percentageCommission,
      commissionEnabled: Boolean(body.commissionEnabled),
    },
  });

  return NextResponse.json(settings);
}
