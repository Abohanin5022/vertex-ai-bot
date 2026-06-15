import Link from "next/link";
import { Mail, MessageCircle, ShieldCheck, X } from "lucide-react";

const whatsapp = "966500000000";
const email = "hello@packora.com";

export default function ContactPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-white pb-20 text-[#111827]">
      <section className="mx-auto max-w-md px-6 py-8">
        <header className="border-b border-[#E5E7EB] pb-8">
          <Link
            href="/packora-1"
            aria-label="الرجوع للمتجر"
            className="grid h-11 w-11 place-items-center rounded-full border border-[#E5E7EB]"
          >
            <X size={21} />
          </Link>

          <p className="mt-8 text-sm text-[#6B7280]">Packora Support</p>

          <h1 className="mt-2 text-[34px] font-semibold leading-tight">
            تواصل معنا
          </h1>

          <p className="mt-4 leading-8 text-[#6B7280]">
            Packora منصة سعودية لمستلزمات التغليف والبلاستيك، نساعد العملاء
            والمطاعم والمتاجر على الطلب والمتابعة من مكان واحد.
          </p>
        </header>

        <div className="grid divide-y divide-[#E5E7EB]">
          <section className="py-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="text-[#1766E8]" size={22} />
              <h2 className="text-xl font-semibold">واتساب</h2>
            </div>
            <p className="mt-2 text-[#6B7280]">
              للدعم السريع واستفسارات الطلبات والمتاجر.
            </p>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block rounded-full bg-black px-6 py-3 font-semibold text-white"
            >
              فتح واتساب
            </a>
          </section>

          <section className="py-6">
            <div className="flex items-center gap-3">
              <Mail className="text-[#1766E8]" size={22} />
              <h2 className="text-xl font-semibold">البريد الإلكتروني</h2>
            </div>
            <a
              href={`mailto:${email}`}
              className="mt-3 inline-block text-[#6B7280]"
            >
              {email}
            </a>
          </section>

          <section className="py-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[#1766E8]" size={22} />
              <h2 className="text-xl font-semibold">سياسات المتجر</h2>
            </div>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-[#6B7280]">
              <p>
                يتم تجهيز الطلبات حسب توفر المخزون، وتظهر حالة الطلب في صفحة
                التتبع بعد تأكيده.
              </p>
              <p>
                طلبات التحويل البنكي تحتاج رفع إيصال واضح وتبقى بانتظار
                المراجعة حتى يعتمدها التاجر.
              </p>
              <p>
                الاسترجاع أو الاستبدال يخضع لحالة المنتج وسياسة المورد، ويمكن
                التواصل معنا للمساعدة في مراجعة الطلب.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
