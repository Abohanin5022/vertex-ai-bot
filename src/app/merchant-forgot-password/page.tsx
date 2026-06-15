import Link from "next/link";
import { PackoraLogo } from "@/components/packora-logo";

export default function MerchantForgotPasswordPage() {
  return (
    <main
      dir="rtl"
      className="grid min-h-screen place-items-center bg-[#F7FBFF] p-6 text-[#070B2A]"
    >
      <section className="w-full max-w-md rounded-[32px] border border-[#DCEBFF] bg-white p-7 text-center shadow-[0_24px_70px_rgba(23,102,232,0.12)]">
        <PackoraLogo href="/packora-2" size="desktop" />
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#1766E8]">
          Packora 2
        </p>
        <h1 className="mt-2 text-3xl font-black">استعادة كلمة المرور</h1>
        <p className="mt-4 text-sm leading-7 text-[#64748B]">
          لاستعادة حساب التاجر، تواصل مع إدارة Packora ليتم التحقق من المتجر
          وإرسال رابط إعادة تعيين كلمة المرور.
        </p>

        <div className="mt-7 grid gap-3">
          <a
            href="https://wa.me/966500000000"
            target="_blank"
            className="rounded-2xl bg-[#1766E8] px-5 py-4 font-black text-white"
          >
            تواصل عبر واتساب
          </a>
          <Link
            href="/packora-2/login"
            className="rounded-2xl border border-[#DCEBFF] px-5 py-4 font-black"
          >
            الرجوع لتسجيل الدخول
          </Link>
        </div>
      </section>
    </main>
  );
}
