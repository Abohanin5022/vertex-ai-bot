"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkNotificationReadButton({
  notificationId,
}: {
  notificationId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markAsRead() {
    setLoading(true);

    try {
      const response = await fetch("/api/merchant/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={markAsRead}
      className="rounded-full border border-[var(--packora-border)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--packora-blue)] hover:text-[var(--packora-blue)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "جاري التحديث..." : "تحديد كمقروء"}
    </button>
  );
}
