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

function makeStoreSlug(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `store-${crypto.randomUUID().slice(0, 8)}`;
}

async function getUniqueStoreSlug(baseSlug: string) {
  let slug = baseSlug;
  let suffix = 2;

  while (
    await prisma.user.findUnique({
      where: {
        storeSlug: slug,
      },
      select: {
        id: true,
      },
    })
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json(
      { error: "أدخل البريد الإلكتروني وكلمة المرور." },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "البريد الإلكتروني مستخدم مسبقًا." },
      { status: 400 }
    );
  }

  const hashed = await hashPassword(password);
  const storeName = body.storeName || body.name || "متجر Packora";
  const storeSlug = await getUniqueStoreSlug(makeStoreSlug(storeName));

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email,
      password: hashed,
      storeName,
      storeSlug,
      role: AUTH_ROLES.merchant,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      storeName: true,
      storeSlug: true,
      createdAt: true,
    },
  });

  const token = createToken(user.id, user.role);
  const response = NextResponse.json({
    success: true,
    user,
  });

  response.cookies.set(MERCHANT_SESSION_COOKIE, token, getAuthCookieOptions());
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });

  return response;
}
