import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  MERCHANT_SESSION_COOKIE,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AUTH_ROLES, type AuthRole } from "@/lib/roles";

type TokenPayload = {
  userId?: string;
  role?: string;
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
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
  storeRating: true,
  storeRatingCount: true,
  subscriptionPlanKey: true,
  subscriptionStatus: true,
  productLimit: true,
  commissionRate: true,
  createdAt: true,
};

export async function getSessionUserFromCookie(
  cookieName: string,
  allowedRoles?: AuthRole[]
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;

    if (!decoded.userId) {
      return null;
    }

    if (allowedRoles?.length && !allowedRoles.includes(decoded.role as AuthRole)) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: userSelect,
    });

    if (!user) {
      return null;
    }

    if (allowedRoles?.length && !allowedRoles.includes(user.role as AuthRole)) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function getCustomerUser() {
  return getSessionUserFromCookie(CUSTOMER_SESSION_COOKIE, [
    AUTH_ROLES.customer,
  ]);
}

export async function getMerchantUser() {
  return getSessionUserFromCookie(MERCHANT_SESSION_COOKIE, [
    AUTH_ROLES.merchant,
  ]);
}

export async function getAdminUser() {
  return getSessionUserFromCookie(ADMIN_SESSION_COOKIE, [AUTH_ROLES.admin]);
}

export async function getAnySessionUser() {
  const admin = await getAdminUser();

  if (admin) {
    return admin;
  }

  const merchant = await getMerchantUser();

  if (merchant) {
    return merchant;
  }

  return getCustomerUser();
}
