import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  MERCHANT_SESSION_COOKIE,
  createToken,
  getAuthCookieOptions,
  hashPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AUTH_ROLES } from "@/lib/roles";

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "أدخل الاسم والبريد الإلكتروني وكلمة المرور." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل." },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "البريد الإلكتروني مستخدم مسبقًا." },
      { status: 400 }
    );
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      role: AUTH_ROLES.customer,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const token = createToken(user.id, user.role);
  const response = NextResponse.json({
    success: true,
    user,
  });

  response.cookies.set(CUSTOMER_SESSION_COOKIE, token, getAuthCookieOptions());
  response.cookies.set(MERCHANT_SESSION_COOKIE, "", {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });

  return response;
}
