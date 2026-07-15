import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  isDashboardAuthConfigured,
  passwordMatches,
} from "@/lib/dashboard-auth";

export async function POST(request: NextRequest) {
  if (!isDashboardAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "لم يتم إعداد كلمة مرور اللوحة بعد. تواصل مع المسؤول لضبط DASHBOARD_PASSWORD وDASHBOARD_AUTH_SECRET.",
      },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!passwordMatches(password)) {
    return NextResponse.json({ error: "كلمة المرور غير صحيحة." }, { status: 401 });
  }

  const token = await createSessionToken();

  if (!token) {
    return NextResponse.json({ error: "تعذر إنشاء الجلسة." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
