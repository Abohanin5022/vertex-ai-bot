"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type OrderStatusActionsProps = {
  orderId: string;
  currentStatus: string;
  compact?: boolean;
};

const statuses = [
  { value: "confirmed", label: "تأكيد الطلب" },
  { value: "preparing", label: "قيد التجهيز" },
  { value: "shipped", label: "تم الشحن" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "إلغاء الطلب" },
];

export function OrderStatusActions({
  orderId,
  currentStatus,
  compact = false,
}: OrderStatusActionsProps) {
  const router = useRouter();
  const [loadingStatus, setLoadingStatus] = useState("");
  const [error, setError] = useState("");

  async function updateOrderStatus(status: string) {
    setLoadingStatus(status);
    setError("");

    const response = await fetch(`/api/merchant/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    });

    setLoadingStatus("");

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error || "تعذر تحديث حالة الطلب.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid gap-3">
      <div
        className={`grid gap-2 ${
          compact ? "grid-cols-1" : "sm:grid-cols-2"
        }`}
      >
        {statuses.map((item) => {
          const isActive = currentStatus === item.value;
          const isLoading = loadingStatus === item.value;

          return (
            <button
              key={item.value}
              type="button"
              disabled={Boolean(loadingStatus) || isActive}
              onClick={() => updateOrderStatus(item.value)}
              className={`rounded-full px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${
                isActive
                  ? "bg-[var(--packora-navy)] text-white"
                  : item.value === "cancelled"
                    ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border border-[var(--packora-border)] bg-white text-[var(--packora-navy)] hover:border-[var(--packora-blue)] hover:bg-[var(--packora-cyan)]"
              }`}
            >
              {isLoading ? "جاري التحديث..." : item.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
