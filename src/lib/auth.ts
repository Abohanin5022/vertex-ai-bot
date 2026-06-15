import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AUTH_ROLES, type AuthRole } from "@/lib/roles";

const SECRET = process.env.JWT_SECRET!;

export const CUSTOMER_SESSION_COOKIE = "packora1_token";
export const MERCHANT_SESSION_COOKIE = "packora2_token";
export const ADMIN_SESSION_COOKIE = "admin_token";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hashed: string
) {
  return bcrypt.compare(password, hashed);
}

export function createToken(userId: string, role?: string) {
  return jwt.sign(
    { userId, role },
    SECRET,
    {
      expiresIn: "30d",
    }
  );
}

export function getSessionCookieName(role?: string | null) {
  if (role === AUTH_ROLES.merchant) {
    return MERCHANT_SESSION_COOKIE;
  }

  if (role === AUTH_ROLES.admin) {
    return ADMIN_SESSION_COOKIE;
  }

  return CUSTOMER_SESSION_COOKIE;
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  };
}

export function isAuthRole(value?: string | null): value is AuthRole {
  return (
    value === AUTH_ROLES.customer ||
    value === AUTH_ROLES.merchant ||
    value === AUTH_ROLES.admin
  );
}
