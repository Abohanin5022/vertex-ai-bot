"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type OrderStatusActionsProps = {
  orderId: string;
  currentStatus: string;
  compact?: boolean;
};

const statuses = [
  { value: "bank_transfer_review", label: "بانتظار مراجعة التحويل" },
  { value: "pending", label: "جديد" },
  { value: "processing", label: "قيد التجهيز" },
  { value: "shipped", label: "جاهز للشحن" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
];

export function OrderStatusActions({
  orderId,
  currentStatus,
  compact = false,
}: OrderStatusActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function updateOrderStatus() {
    setLoading(true);

    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      alert("تعذر تحديث حالة الطلب");
      return;
    }

    router.refresh();
  }

  return (
    <div
      className={`flex items-center gap-2 ${
        compact ? "min-w-0" : "min-w-[260px]"
      }`}
    >
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="min-w-0 flex-1 rounded-full border border-[var(--packora-border)] bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-[var(--packora-blue)]"
      >
        {statuses.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={updateOrderStatus}
        disabled={loading || status === currentStatus}
        className="rounded-full bg-[var(--packora-blue)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--packora-blue-dark)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "..." : "تحديث"}
      </button>
    </div>
  );
}
