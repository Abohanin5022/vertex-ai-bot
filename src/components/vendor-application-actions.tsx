"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function VendorApplicationActions({
  applicationId,
  status,
}: {
  applicationId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const disabled = status === "accepted" || status === "rejected" || !!loading;

  async function update(action: "accept" | "reject") {
    setLoading(action);

    await fetch(`/api/admin/vendor-applications/${applicationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });

    setLoading(null);
    router.refresh();
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => update("accept")}
        className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading === "accept" ? "جاري القبول..." : "قبول"}
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => update("reject")}
        className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-50"
      >
        {loading === "reject" ? "جاري الرفض..." : "رفض"}
      </button>
    </div>
  );
}
