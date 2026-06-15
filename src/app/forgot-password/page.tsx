import Link from "next/link";
import { PackoraLogo } from "@/components/packora-logo";

export default function ForgotPasswordPage() {
  return (
    <main
      dir="rtl"
      className="grid min-h-screen place-items-center bg-[#EAFBFF] p-6 text-[var(--packora-navy)]"
    >
      <section className="w-full max-w-md rounded-[32px] border border-[var(--packora-border)] bg-white p-7 text-center shadow-[0_24px_70px_rgba(23,102,232,0.12)]">
        <PackoraLogo href="/packora-1" size="desktop" />
        <p className="mt-5 text-sm font-semibold text-[#64748B]">
          Packora 1
        </p>
        <h1 className="mt-2 text-3xl font-black">نسيت كلمة المرور؟</h1>
        <p className="mt-3 text-sm leading-7 text-[#64748B]">
          تواصل مع فريق Packora لاستعادة حساب العميل. سيتم تفعيل الاستعادة
          الذاتية لاحقًا.
        </p>
        <Link
          href="/packora-1/login"
          className="mt-6 block rounded-2xl bg-[var(--packora-blue)] py-4 font-black text-white transition hover:bg-[var(--packora-blue-dark)]"
        >
          الرجوع لتسجيل الدخول
        </Link>
      </section>
    </main>
  );
}
