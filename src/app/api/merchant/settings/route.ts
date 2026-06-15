import { NextResponse } from "next/server";
import { getMerchantUser } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanOptional(value: unknown) {
  const text = String(value || "").trim();
  return text || null;
}

function serviceAvailability() {
  const moyasarEnabled = Boolean(
    process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY &&
      process.env.MOYASAR_SECRET_KEY
  );

  return {
    cod: true,
    bankTransfer: true,
    electronicPayment: moyasarEnabled,
    applePay: moyasarEnabled,
    mada: moyasarEnabled,
    cards: moyasarEnabled,
    tabby: Boolean(process.env.TABBY_SECRET_KEY && process.env.TABBY_MERCHANT_CODE),
    tamara: Boolean(process.env.TAMARA_API_TOKEN),
  };
}

function cleanObject(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function cleanMerchantServices(value: unknown) {
  const available = serviceAvailability();
  const services = cleanObject(value);

  return Object.fromEntries(
    Object.entries(available).map(([key, isAvailable]) => [
      key,
      isAvailable && services[key] === true,
    ])
  );
}

function cleanBankAccount(value: unknown) {
  const bank = cleanObject(value);

  return {
    beneficiaryName: cleanOptional(bank.beneficiaryName),
    bankName: cleanOptional(bank.bankName),
    iban: cleanOptional(bank.iban),
    accountNumber: cleanOptional(bank.accountNumber),
    transferNotes: cleanOptional(bank.transferNotes),
  };
}

function cleanShippingMethods(value: unknown) {
  const shipping = cleanObject(value);
  const keys = ["localDelivery", "storePickup", "smsa", "aramex", "spl", "naqel"];

  return Object.fromEntries(
    keys.map((key) => {
      const item = cleanObject(shipping[key]);
      const cost = Number(item.cost || 0);

      return [
        key,
        {
          enabled: item.enabled === true,
          cost: Number.isFinite(cost) && cost >= 0 ? cost : 0,
          eta: cleanOptional(item.eta),
          notes: cleanOptional(item.notes),
        },
      ];
    })
  );
}

function cleanInstallments(value: unknown) {
  const available = serviceAvailability();
  const installments = cleanObject(value);

  return Object.fromEntries(
    (["tabby", "tamara"] as const).map((key) => {
      const item = cleanObject(installments[key]);
      const isAvailable = available[key];
      const status = cleanOptional(item.status) || (isAvailable ? "بانتظار الربط" : "غير متاح");

      return [
        key,
        {
          enabled: isAvailable && item.enabled === true,
          status: isAvailable ? status : "غير متاح",
        },
      ];
    })
  );
}

export async function PATCH(req: Request) {
  const user = await getMerchantUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const storeName = String(body.storeName || user.name || "متجر").trim();
  const normalizedSlug = normalizeSlug(String(body.storeSlug || storeName));
  const storeSlug = normalizedSlug || `store-${user.id.slice(0, 8)}`;

  const existing = await prisma.user.findFirst({
    where: {
      storeSlug,
      NOT: {
        id: user.id,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "رابط المتجر مستخدم مسبقًا" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      storeName,
      storeSlug,
      storeDescription: cleanOptional(body.storeDescription),
      storeLogo: cleanOptional(body.storeLogo),
      storeBanner: cleanOptional(body.storeBanner),
      storeWhatsapp: cleanOptional(body.storeWhatsapp),
      storeCity: cleanOptional(body.storeCity),
      storeHours: cleanOptional(body.storeHours),
      merchantServices: cleanMerchantServices(body.merchantServices),
      merchantBankAccount: cleanBankAccount(body.merchantBankAccount),
      merchantShippingMethods: cleanShippingMethods(body.merchantShippingMethods),
      merchantInstallments: cleanInstallments(body.merchantInstallments),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      storeName: true,
      storeSlug: true,
      storeDescription: true,
      storeLogo: true,
      storeBanner: true,
      storeWhatsapp: true,
      storeCity: true,
      storeHours: true,
      merchantServices: true,
      merchantBankAccount: true,
      merchantShippingMethods: true,
      merchantInstallments: true,
      createdAt: true,
    },
  });

  return NextResponse.json(updated);
}
