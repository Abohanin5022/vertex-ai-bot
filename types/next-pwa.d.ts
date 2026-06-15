declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PWAOptions = {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    [key: string]: unknown;
  };

  export default function createPWA(
    options?: PWAOptions
  ): (config?: NextConfig) => NextConfig;
}

declare module "next-pwa/cache" {
  const runtimeCaching: unknown[];
  export default runtimeCaching;
}
