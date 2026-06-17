import type { Metadata, Viewport } from "next";
import { DevServiceWorkerReset } from "@/components/dev-service-worker-reset";
import { InstallBanner } from "@/components/install-banner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Packora السعودية",
  description:
    "تطبيق عربي للبلاستيكيات والتغليف مع لوحة تاجر مستقلة وسلة عميل ودفع وشحن داخل السعودية",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#EC4899",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar-SA" dir="rtl" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <DevServiceWorkerReset />
        {children}
        <InstallBanner />
      </body>
    </html>
  );
}
