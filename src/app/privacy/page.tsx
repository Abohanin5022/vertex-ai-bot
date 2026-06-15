import Link from "next/link";
import { X } from "lucide-react";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="سياسة الخصوصية"
      eyebrow="Packora Privacy"
      description="نوضح هنا كيف تتعامل Packora مع بيانات العملاء والموردين أثناء استخدام المنصة."
      items={[
        {
          title: "البيانات التي نجمعها",
          body: "نجمع بيانات الطلب الأساسية مثل الاسم، رقم الجوال، المدينة، العنوان، ومعلومات المنتجات المطلوبة لإتمام تجربة الشراء والتتبع.",
        },
        {
          title: "استخدام البيانات",
          body: "تُستخدم البيانات لمعالجة الطلبات، التواصل مع العميل، تحسين الخدمة، وتمكين الموردين من إدارة منتجاتهم وطلباتهم داخل المنصة.",
        },
        {
          title: "مشاركة البيانات",
          body: "لا نبيع بيانات المستخدمين. قد تتم مشاركة بيانات الطلب الضرورية مع المورد أو شركة الشحن عند الحاجة لتنفيذ الطلب.",
        },
        {
          title: "حماية الحساب",
          body: "نوصي المستخدمين بالحفاظ على بيانات الدخول وتغيير كلمة المرور المؤقتة بعد أول تسجيل دخول.",
        },
      ]}
    />
  );
}

function LegalPage({
  title,
  eyebrow,
  description,
  items,
}: {
  title: string;
  eyebrow: string;
  description: string;
  items: { title: string; body: string }[];
}) {
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

          <p className="mt-8 text-sm text-[#6B7280]">{eyebrow}</p>

          <h1 className="mt-2 text-[34px] font-semibold leading-tight">
            {title}
          </h1>

          <p className="mt-4 leading-8 text-[#6B7280]">{description}</p>
        </header>

        <div className="grid divide-y divide-[#E5E7EB]">
          {items.map((item) => (
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
