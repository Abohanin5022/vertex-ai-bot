import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ServiceKey =
  | "cod"
  | "bankTransfer"
  | "electronicPayment"
  | "applePay"
  | "mada"
  | "cards"
  | "tabby"
  | "tamara";

type ShippingKey =
  | "localDelivery"
  | "storePickup"
  | "smsa"
  | "aramex"
  | "spl"
  | "naqel";

const serviceKeys: ServiceKey[] = [
  "cod",
  "bankTransfer",
  "electronicPayment",
  "applePay",
  "mada",
  "cards",
  "tabby",
  "tamara",
];

const shippingLabels: Record<ShippingKey, string> = {
  localDelivery: "توصيل محلي",
  storePickup: "استلام من المتجر",
  smsa: "سمسا",
  aramex: "أرامكس",
  spl: "SPL",
  naqel: "ناقل",
};

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function textValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function gatewayAvailability() {
  const moyasarEnabled = Boolean(
    process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY &&
      process.env.MOYASAR_SECRET_KEY
  );

  return {
    moyasarEnabled,
    tabbyEnabled: Boolean(
      process.env.TABBY_SECRET_KEY && process.env.TABBY_MERCHANT_CODE
    ),
    tamaraEnabled: Boolean(process.env.TAMARA_API_TOKEN),
  };
}

function bankIsComplete(bank: Record<string, unknown>) {
  return Boolean(
    textValue(bank.beneficiaryName) &&
      textValue(bank.bankName) &&
      textValue(bank.iban) &&
      textValue(bank.accountNumber)
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productIds = Array.from(
    new Set(
      (searchParams.get("productIds") || "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    )
  );

  if (!productIds.length) {
    return NextResponse.json({
      merchant: null,
      services: {},
      bankAccount: null,
      bankTransferAvailable: false,
      shippingMethods: [],
      gateways: gatewayAvailability(),
      multipleMerchants: false,
    });
  }

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
      deletedAt: null,
      isActive: true,
      user: {
        is: {
          role: "merchant",
          isActive: true,
        },
      },
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          storeName: true,
          name: true,
          merchantServices: true,
          merchantBankAccount: true,
          merchantShippingMethods: true,
          merchantInstallments: true,
        },
      },
    },
  });

  const merchants = Array.from(
    new Map(products.map((product) => [product.user.id, product.user])).values()
  );
  const merchant = merchants[0] || null;

  if (!merchant) {
    return NextResponse.json({
      merchant: null,
      services: {},
      bankAccount: null,
      bankTransferAvailable: false,
      shippingMethods: [],
      gateways: gatewayAvailability(),
      multipleMerchants: false,
    });
  }

  const servicesSource = asRecord(merchant.merchantServices);
  const gateways = gatewayAvailability();
  const services = Object.fromEntries(
    serviceKeys.map((key) => [key, servicesSource[key] === true])
  ) as Record<ServiceKey, boolean>;
  const bankAccount = asRecord(merchant.merchantBankAccount);
  const bankTransferAvailable =
    services.bankTransfer && bankIsComplete(bankAccount);
  const shippingSource = asRecord(merchant.merchantShippingMethods);
  const shippingMethods = (Object.keys(shippingLabels) as ShippingKey[])
    .map((key) => {
      const item = asRecord(shippingSource[key]);

      return {
        key,
        label: shippingLabels[key],
        enabled: item.enabled === true,
        cost: numberValue(item.cost),
        eta: textValue(item.eta),
        notes: textValue(item.notes),
      };
    })
    .filter((item) => item.enabled);
  const installments = asRecord(merchant.merchantInstallments);

  return NextResponse.json({
    merchant: {
      id: merchant.id,
      name: merchant.storeName || merchant.name || "متجر Packora",
    },
    services: {
      ...services,
      bankTransfer: bankTransferAvailable,
      electronicPayment: services.electronicPayment && gateways.moyasarEnabled,
      applePay:
        services.electronicPayment && services.applePay && gateways.moyasarEnabled,
      mada: services.electronicPayment && services.mada && gateways.moyasarEnabled,
      cards: services.electronicPayment && services.cards && gateways.moyasarEnabled,
      tabby:
        services.tabby &&
        gateways.tabbyEnabled &&
        asRecord(installments.tabby).enabled === true,
      tamara:
        services.tamara &&
        gateways.tamaraEnabled &&
        asRecord(installments.tamara).enabled === true,
    },
    rawServices: services,
    bankAccount: bankTransferAvailable
      ? {
          beneficiaryName: textValue(bankAccount.beneficiaryName),
          bankName: textValue(bankAccount.bankName),
          iban: textValue(bankAccount.iban),
          accountNumber: textValue(bankAccount.accountNumber),
          transferNotes: textValue(bankAccount.transferNotes),
        }
      : null,
    bankTransferAvailable,
    bankTransferEnabledWithoutAccount:
      services.bankTransfer && !bankIsComplete(bankAccount),
    shippingMethods,
    gateways,
    multipleMerchants: merchants.length > 1,
  });
}
