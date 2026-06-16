"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PaymentProofActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | "">("");

  async function review(action: "approve" | "reject") {
    setLoading(action);

    const response = await fetch(
      `/api/merchant/orders/${orderId}/payment-proof`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
        }),
      }
    );

    setLoading("");

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      alert(data?.error || "تعذر تحديث حالة التحويل البنكي.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={() => review("approve")}
        disabled={!!loading}
        className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading === "approve" ? "جاري القبول..." : "قبول التحويل"}
      </button>

      <button
        type="button"
        onClick={() => review("reject")}
        disabled={!!loading}
        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
      >
        {loading === "reject" ? "جاري الرفض..." : "رفض التحويل"}
      </button>
    </div>
  );
}
