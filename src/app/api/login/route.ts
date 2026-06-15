import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  MERCHANT_SESSION_COOKIE,
  comparePassword,
  createToken,
  getAuthCookieOptions,
  getSessionCookieName,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AUTH_ROLES, type AuthRole } from "@/lib/roles";

type LoginPayload = {
  email?: string;
  password?: string;
  role?: AuthRole;
};

function clearOtherSessions(response: NextResponse, activeCookie: string) {
  for (const cookieName of [
    CUSTOMER_SESSION_COOKIE,
    MERCHANT_SESSION_COOKIE,
    ADMIN_SESSION_COOKIE,
  ]) {
    if (cookieName === activeCookie) {
      continue;
    }

    response.cookies.set(cookieName, "", {
      ...getAuthCookieOptions(),
      maxAge: 0,
    });
  }
}

export async function loginWithRole(req: Request, role?: AuthRole) {
  const body = (await req.json()) as LoginPayload;
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const expectedRole = role || body.role || AUTH_ROLES.customer;

  if (!email || !password) {
    return NextResponse.json(
      { error: "أدخل البريد الإلكتروني وكلمة المرور." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "المستخدم غير موجود." },
      { status: 401 }
    );
  }

  const valid = await comparePassword(password, user.password);

  if (!valid) {
    return NextResponse.json(
      { error: "كلمة المرور غير صحيحة." },
      { status: 401 }
    );
  }

  if (user.role !== expectedRole) {
    const labels: Record<AuthRole, string> = {
      customer: "عميل",
      merchant: "تاجر",
      admin: "إدارة",
    };

    return NextResponse.json(
      { error: `هذا الحساب ليس حساب ${labels[expectedRole]}.` },
      { status: 403 }
    );
  }

  const cookieName = getSessionCookieName(user.role);
  const token = createToken(user.id, user.role);
  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      storeSlug: user.storeSlug,
      storeName: user.storeName,
    },
  });

  response.cookies.set(cookieName, token, getAuthCookieOptions());
  clearOtherSessions(response, cookieName);

  return response;
}

export async function POST(req: Request) {
  return loginWithRole(req);
}
