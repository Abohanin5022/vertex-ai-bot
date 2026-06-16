import type { NextConfig } from "next";
import createBundleAnalyzer from "@next/bundle-analyzer";
import createPWA from "next-pwa";
import defaultRuntimeCaching from "next-pwa/cache";

const authCacheDenylist = [
  /^\/login(?:\/)?$/,
  /^\/merchant-login(?:\/)?$/,
  /^\/register(?:\/)?$/,
  /^\/merchant-register(?:\/)?$/,
  /^\/api\/customer\/login(?:\/)?$/,
  /^\/api\/merchant\/login(?:\/)?$/,
];

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/orders/[id]/invoice": ["./node_modules/pdfkit/js/data/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const withPWA = createPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  dynamicStartUrl: false,
  publicExcludes: [
    "!login",
    "!merchant-login",
    "!register",
    "!merchant-register",
  ],
  buildExcludes: [
    /app\/login\/page.*\.js$/,
    /app\/merchant-login\/page.*\.js$/,
    /app\/register\/page.*\.js$/,
    /app\/merchant-register\/page.*\.js$/,
    /app\/api\/customer\/login\/route.*\.js$/,
    /app\/api\/merchant\/login\/route.*\.js$/,
  ],
  runtimeCaching: [
    {
      urlPattern: ({ url }: { url: URL }) =>
        authCacheDenylist.some((pattern) => pattern.test(url.pathname)),
      handler: "NetworkOnly",
      method: "GET",
      options: {},
    },
    {
      urlPattern: ({ url }: { url: URL }) =>
        authCacheDenylist.some((pattern) => pattern.test(url.pathname)),
      handler: "NetworkOnly",
      method: "POST",
      options: {},
    },
    ...defaultRuntimeCaching,
  ],
  fallbacks: {
    document: "/offline",
  },
  disable: process.env.NODE_ENV === "development",
});

export default withBundleAnalyzer(withPWA(nextConfig));
