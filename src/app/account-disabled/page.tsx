import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AccountDisabledPage() {
  return (
    <main
      dir="rtl"
      className="grid min-h-screen place-items-center bg-white p-8 text-[#111827]"
    >
      <section className="max-w-md text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-[#E5E7EB] text-5xl">
          <AlertTriangle size={44} strokeWidth={1.7} />
        </div>

        <h1 className="mt-6 text-[34px] font-semibold leading-tight">
          تم تعطيل حساب المتجر
        </h1>

        <p className="mt-4 leading-8 text-[#6B7280]">
          لا يمكنك الدخول إلى لوحة التاجر حاليًا. يرجى التواصل مع إدارة Packora
          لمعرفة سبب التعطيل أو إعادة التفعيل.
        </p>

        <Link
          href="/packora-1"
          className="mt-8 inline-block rounded-full bg-black px-8 py-4 font-semibold text-white"
        >
          الرجوع للمتجر
        </Link>
      </section>
    </main>
  );
}
