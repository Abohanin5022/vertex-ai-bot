import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, JetBrains_Mono } from "next/font/google";
import { AppShell } from "@/components/ui/app-shell";
import { WebVitalsReporter } from "@/components/web-vitals-reporter";
import "./globals.css";

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Packora — لوحة التشغيل",
  description: "لوحة تشغيل المخزون والمنتجات لـ Packora",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${plexArabic.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="paper-texture min-h-full flex flex-col">
        <WebVitalsReporter />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
