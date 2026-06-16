"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PaymentProofReupload({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadReceipt(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload-payment-proof", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.url) {
        throw new Error(uploadData.error || "تعذر رفع الإيصال.");
      }

      const updateResponse = await fetch(
        `/api/orders/${orderId}/payment-proof`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bankTransferReceipt: uploadData.url,
          }),
        }
      );

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(updateData.error || "تعذر تحديث إيصال التحويل.");
      }

      setMessage("تم رفع الإيصال الجديد وإرساله للمراجعة.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء رفع الإيصال."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="mt-4 rounded-[22px] border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-700">
        تم رفض إيصال التحويل السابق. يمكنك رفع إيصال جديد وإرساله للمراجعة.
      </p>

      <label className="mt-4 inline-flex cursor-pointer rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1766E8]">
        {uploading ? "جاري رفع الإيصال..." : "إعادة رفع إيصال التحويل"}
        <input
          type="file"
          accept="image/*,application/pdf"
          disabled={uploading}
          onChange={uploadReceipt}
          className="hidden"
        />
      </label>

      {message ? (
        <p className="mt-3 text-sm font-semibold text-[#111827]">{message}</p>
      ) : null}
    </div>
  );
}
