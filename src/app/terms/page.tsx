import Link from "next/link";
import { X } from "lucide-react";

const terms = [
  {
    title: "استخدام المنصة",
    body: "تتيح Packora للعملاء تصفح منتجات التغليف والبلاستيك، وإرسال الطلبات، وتتبع حالتها، كما تتيح للموردين إدارة متاجرهم ومنتجاتهم.",
  },
  {
    title: "الطلبات والأسعار",
    body: "الأسعار المعروضة قابلة للتحديث حسب توفر المنتج، الكمية، أو اتفاق المورد مع العميل. يتم تأكيد الطلب بعد استلام بيانات العميل كاملة.",
  },
  {
    title: "الموردون",
    body: "يلتزم المورد بإدخال بيانات منتجات صحيحة، صور مناسبة، ومتابعة الطلبات في الوقت المناسب. يحق للإدارة تعطيل المتجر عند مخالفة سياسة المنصة.",
  },
  {
    title: "الاسترجاع",
    body: "سياسة الاسترجاع التفصيلية ستُضاف لاحقًا، وتختلف حسب طبيعة المنتج وحالة الطلب واتفاق المورد مع العميل.",
  },
];

export default function TermsPage() {
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

          <p className="mt-8 text-sm text-[#6B7280]">Packora Terms</p>

          <h1 className="mt-2 text-[34px] font-semibold leading-tight">
            الشروط والأحكام
          </h1>

          <p className="mt-4 leading-8 text-[#6B7280]">
            باستخدامك Packora فأنت توافق على هذه الشروط المبدئية الخاصة
            بالعملاء والموردين.
          </p>
        </header>

        <div className="grid divide-y divide-[#E5E7EB]">
          {terms.map((item) => (
            <article key={item.title} className="py-6">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-3 leading-8 text-[#6B7280]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
