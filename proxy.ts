import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type TokenPayload = {
  role?: string;
  userId?: string;
};

const PACKORA2_COOKIE = "packora2_token";
const ADMIN_COOKIE = "admin_token";

const legacyRedirects: Array<{
  from: string;
  to: string;
  includeSubpaths?: boolean;
}> = [
  { from: "/customer", to: "/packora-1", includeSubpaths: true },
  { from: "/login", to: "/packora-1/login" },
  { from: "/register", to: "/packora-1/register" },
  { from: "/cart", to: "/packora-1/cart" },
  { from: "/checkout", to: "/packora-1/checkout" },
  { from: "/track", to: "/packora-1/track", includeSubpaths: true },
  { from: "/merchant", to: "/packora-2", includeSubpaths: true },
  { from: "/merchant-login", to: "/packora-2/login" },
  { from: "/merchant-register", to: "/packora-2/register" },
];

function isSegment(pathname: string, segment: string) {
  return pathname === segment || pathname.startsWith(`${segment}/`);
}

function decodeTokenPayload(token?: string): TokenPayload | null {
  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return null;
    }

    const padded = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      "="
    );
    const json = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));

    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

function getCookieRole(req: NextRequest, cookieName: string) {
  return decodeTokenPayload(req.cookies.get(cookieName)?.value)?.role;
}

function redirectTo(path: string, req: NextRequest) {
  const url = new URL(path, req.url);
  url.search = req.nextUrl.search;

  return NextResponse.redirect(url);
}

function redirectLegacyPath(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  for (const redirect of legacyRedirects) {
    if (
      pathname === redirect.from ||
      (redirect.includeSubpaths && pathname.startsWith(`${redirect.from}/`))
    ) {
      const suffix =
        redirect.includeSubpaths && pathname !== redirect.from
          ? pathname.slice(redirect.from.length)
          : "";

      return redirectTo(`${redirect.to}${suffix}`, req);
    }
  }

  return null;
}

function enforcePackora2(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname === "/packora-2/login" || pathname === "/packora-2/register") {
    return null;
  }

  const merchantRole = getCookieRole(req, PACKORA2_COOKIE);

  if (merchantRole !== "merchant") {
    return redirectTo("/packora-2/login", req);
  }

  return null;
}

function enforceAdmin(req: NextRequest) {
  const adminRole = getCookieRole(req, ADMIN_COOKIE);

  if (adminRole !== "admin") {
    return redirectTo("/admin-login", req);
  }

  return null;
}

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const legacyRedirect = redirectLegacyPath(req);

  if (legacyRedirect) {
    return legacyRedirect;
  }

  if (isSegment(pathname, "/packora-2")) {
    return enforcePackora2(req) || NextResponse.next();
  }

  if (isSegment(pathname, "/admin")) {
    return enforceAdmin(req) || NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/customer/:path*",
    "/login",
    "/register",
    "/cart",
    "/checkout",
    "/track/:path*",
    "/merchant/:path*",
    "/merchant-login",
    "/merchant-register",
    "/packora-2/:path*",
    "/admin/:path*",
  ],
};
