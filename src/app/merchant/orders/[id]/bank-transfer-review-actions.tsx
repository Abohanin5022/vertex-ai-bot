"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BankTransferReviewActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accepted" | "rejected" | "">("");

  async function review(paymentProofStatus: "accepted" | "rejected") {
    setLoading(paymentProofStatus);

    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentProofStatus,
      }),
    });

    setLoading("");

    if (!response.ok) {
      alert("تعذر تحديث حالة التحويل.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => review("accepted")}
        disabled={!!loading}
        className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading === "accepted" ? "جاري القبول..." : "قبول التحويل"}
      </button>

      <button
        type="button"
        onClick={() => review("rejected")}
        disabled={!!loading}
        className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
      >
        {loading === "rejected" ? "جاري الرفض..." : "رفض التحويل"}
      </button>
    </div>
  );
}
