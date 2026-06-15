import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  MERCHANT_SESSION_COOKIE,
  getAuthCookieOptions,
} from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
  });

  for (const cookieName of [
    CUSTOMER_SESSION_COOKIE,
    MERCHANT_SESSION_COOKIE,
    ADMIN_SESSION_COOKIE,
  ]) {
    response.cookies.set(cookieName, "", {
      ...getAuthCookieOptions(),
      maxAge: 0,
    });
  }

  return response;
}
