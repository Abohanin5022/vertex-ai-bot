"use client";

type OrderDetailActionsProps = {
  whatsappUrl: string;
};

export function OrderDetailActions({ whatsappUrl }: OrderDetailActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-full border border-[var(--packora-border)] px-5 py-3 text-sm font-semibold text-[var(--packora-navy)] transition hover:border-[var(--packora-blue)] hover:bg-[var(--packora-cyan)]"
      >
        طباعة الطلب
      </button>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        إرسال واتساب للعميل
      </a>
    </div>
  );
}
