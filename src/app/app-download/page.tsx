import Link from "next/link";
import { Download, QrCode, Smartphone } from "lucide-react";
import { mobileConfig } from "@/lib/mobile-config";

const appUrl = "https://packora-dashboard.vercel.app/packora-1";
const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
  appUrl
)}`;

export default function AppDownloadPage() {
  return (
    <main dir="rtl" className={mobileConfig.pageClassName}>
      <section className={`${mobileConfig.sectionClassName} px-6 py-8`}>
        <header className="border-b border-[var(--packora-border)] pb-8">
          <div className="grid h-16 w-16 place-items-center rounded-[24px] bg-[var(--packora-cyan)] text-[var(--packora-blue)]">
            <Smartphone size={30} />
          </div>

          <p className="mt-6 text-sm text-[#6B7280]">Packora Mobile</p>
          <h1 className="mt-2 text-3xl font-black leading-tight">
            ثبّت Packora على جوالك
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#6B7280]">
            النسخة الحالية تعمل كتطبيق PWA قابل للتثبيت، وتطبيقات App Store
            وGoogle Play ستكون متاحة قريبًا.
          </p>
        </header>

        <section className="mt-8 grid gap-4">
          <DownloadCard
            title="App Store"
            subtitle="قريبًا لأجهزة iPhone"
            disabled
          />
          <DownloadCard
            title="Google Play"
            subtitle="قريبًا لأجهزة Android"
            disabled
          />
          <Link
            href="/packora-1"
            className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-[var(--packora-blue)] px-5 py-4 text-center font-black text-white"
          >
            <Download size={20} />
            فتح نسخة الويب
          </Link>
        </section>

        <section className="mt-8 rounded-[30px] border border-[var(--packora-border)] bg-white p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--packora-cyan)] text-[var(--packora-blue)]">
            <QrCode size={28} />
          </div>
          <h2 className="mt-4 text-xl font-black">QR Code</h2>
          <p className="mt-2 text-sm leading-7 text-[#6B7280]">
            امسح الكود لفتح Packora من الجوال.
          </p>

          <div className="mt-5 inline-grid rounded-[24px] border border-[var(--packora-border)] bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="QR Code Packora"
              width={220}
              height={220}
              className="h-52 w-52"
            />
          </div>
        </section>
      </section>
    </main>
  );
}

function DownloadCard({
  title,
  subtitle,
  disabled,
}: {
  title: string;
  subtitle: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={`rounded-[26px] border border-[var(--packora-border)] p-5 ${
        disabled ? "bg-[#F8FAFC] text-[#6B7280]" : "bg-white"
      }`}
    >
      <p className="text-lg font-black">{title}</p>
      <p className="mt-1 text-sm">{subtitle}</p>
    </div>
  );
}
