import Link from "next/link";
import { WifiOff } from "lucide-react";
import { mobileConfig } from "@/lib/mobile-config";

export default function OfflinePage() {
  return (
    <main dir="rtl" className={mobileConfig.pageClassName}>
      <section className={`${mobileConfig.sectionClassName} grid min-h-screen place-items-center px-8 text-center`}>
        <div>
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-[32px] bg-[var(--packora-cyan)] text-[var(--packora-blue)]">
            <WifiOff size={44} />
          </div>

          <h1 className="mt-7 text-3xl font-black leading-tight">
            أنت غير متصل بالإنترنت
          </h1>

          <p className="mt-4 text-sm leading-8 text-[#6B7280]">
            تحقق من الاتصال ثم أعد المحاولة. بعض صفحات Packora ستكون متاحة دون
            اتصال في التحديثات القادمة.
          </p>

          <Link
            href="/packora-1"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--packora-blue)] px-8 py-4 font-black text-white"
          >
            إعادة المحاولة
          </Link>
        </div>
      </section>
    </main>
  );
}
