import { prisma } from "@/lib/prisma";

export type ProfitabilityOrderItem = {
  id?: string;
  productId?: string;
  quantity: number;
  price: number;
};

export const defaultSubscriptionPlans = [
  {
    key: "free",
    name: "مجاني",
    productLimit: 20,
    commissionRate: 0.08,
    features: ["متجر مستقل", "إدارة منتجات أساسية", "عمولة أعلى"],
  },
  {
    key: "basic",
    name: "أساسي",
    productLimit: 80,
    commissionRate: 0.06,
    features: ["منتجات أكثر", "كوبونات", "تقارير أساسية"],
  },
  {
    key: "pro",
    name: "احترافي",
    productLimit: 250,
    commissionRate: 0.04,
    features: ["تحليلات متقدمة", "أولوية في الظهور", "دعم أسرع"],
  },
  {
    key: "enterprise",
    name: "مؤسسي",
    productLimit: 1000,
    commissionRate: 0.025,
    features: ["حد منتجات مرتفع", "دعم مخصص", "عمولة مخفضة"],
  },
];

export async function getCommissionSettings() {
  const fallback = {
    id: "platform",
    fixedCommission: 0,
    percentageCommission: 0.05,
    commissionEnabled: true,
  };

  try {
    const settings = await prisma.platformCommissionSetting.findUnique({
      where: { id: "platform" },
    });

    return settings || fallback;
  } catch {
    return fallback;
  }
}

export async function calculateOrderProfitability(
  items: ProfitabilityOrderItem[],
  requestedTotal?: number
) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const total =
    Number.isFinite(requestedTotal) && Number(requestedTotal) >= 0
      ? Number(requestedTotal)
      : subtotal;
  const settings = await getCommissionSettings();

  if (!settings.commissionEnabled) {
    return {
      subtotal,
      total,
      commission: 0,
      merchantNet: total,
      platformRevenue: 0,
    };
  }

  const productIds = Array.from(
    new Set(
      items
        .map((item) => item.productId || item.id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const products = productIds.length
    ? await prisma.product
        .findMany({
          where: {
            id: {
              in: productIds,
            },
          },
          select: {
            id: true,
            user: {
              select: {
                commissionRate: true,
              },
            },
          },
        })
        .catch(() => [])
    : [];

  const rateByProduct = new Map(
    products.map((product) => [product.id, product.user.commissionRate])
  );

  const percentageCommission = items.reduce((sum, item) => {
    const productId = item.productId || item.id || "";
    const rate =
      rateByProduct.get(productId) ?? settings.percentageCommission;
    const itemSubtotal =
      Number(item.price || 0) * Number(item.quantity || 0);

    return sum + itemSubtotal * rate;
  }, 0);

  const commission = Math.max(
    0,
    settings.fixedCommission + percentageCommission
  );
  const merchantNet = Math.max(0, total - commission);

  return {
    subtotal,
    total,
    commission,
    merchantNet,
    platformRevenue: commission,
  };
}
