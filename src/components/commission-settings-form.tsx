"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CommissionSettingsForm({
  fixedCommission,
  percentageCommission,
  commissionEnabled,
}: {
  fixedCommission: number;
  percentageCommission: number;
  commissionEnabled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/monetization", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fixedCommission: Number(formData.get("fixedCommission")),
        percentageCommission: Number(formData.get("percentageCommission")) / 100,
        commissionEnabled: formData.get("commissionEnabled") === "on",
      }),
    });

    setLoading(false);

    if (!response.ok) {
      setMessage("تعذر حفظ إعدادات العمولة");
      return;
    }

    setMessage("تم حفظ إعدادات العمولة");
    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[28px] border border-[var(--packora-border)] bg-white p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#6B7280]">إعدادات عمولة المنصة</p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--packora-navy)]">
            العمولة العامة
          </h2>
        </div>

        <label className="inline-flex items-center gap-2 rounded-full border border-[var(--packora-border)] px-4 py-2 text-sm font-semibold">
          <input
            name="commissionEnabled"
            type="checkbox"
            defaultChecked={commissionEnabled}
          />
          تفعيل العمولة
        </label>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-[var(--packora-navy)]">
            عمولة ثابتة لكل طلب
          </span>
          <input
            name="fixedCommission"
            type="number"
            min="0"
            step="0.01"
            defaultValue={fixedCommission}
            className="rounded-full border border-[var(--packora-border)] px-5 py-4 outline-none focus:border-[var(--packora-blue)]"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-[var(--packora-navy)]">
            عمولة نسبة مئوية
          </span>
          <input
            name="percentageCommission"
            type="number"
            min="0"
            step="0.1"
            defaultValue={(percentageCommission * 100).toFixed(1)}
            className="rounded-full border border-[var(--packora-border)] px-5 py-4 outline-none focus:border-[var(--packora-blue)]"
          />
        </label>
      </div>

      <button
        disabled={loading}
        className="mt-6 rounded-full bg-[var(--packora-blue)] px-6 py-4 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </button>

      {message ? (
        <p className="mt-4 rounded-[18px] border border-[var(--packora-border)] p-3 text-sm font-semibold">
          {message}
        </p>
      ) : null}
    </form>
  );
}
