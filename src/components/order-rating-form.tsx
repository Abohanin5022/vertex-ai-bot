"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { postJson } from "@/lib/mobile-api";
import { mobileApiEndpoints } from "@/lib/mobile-config";

type RatingItem = {
  id: string;
  productId?: string | null;
  name: string;
};

export function OrderRatingForm({
  orderId,
  status,
  items,
}: {
  orderId: string;
  status: string;
  items: RatingItem[];
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const rateableItems = items.filter((item) => item.productId);

  if (status !== "completed" || rateableItems.length === 0) {
    return null;
  }

  async function submitRating(productId: string) {
    setLoading(true);
    setMessage("");

    try {
      await postJson<{ success: boolean }>(mobileApiEndpoints.ratings, {
        orderId,
        productId,
        rating,
        comment,
      });
      setMessage("تم إرسال التقييم بنجاح");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر إرسال التقييم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-4 rounded-[24px] border border-[#E5E7EB] bg-white p-5">
      <h3 className="text-lg font-semibold text-[#111827]">قيّم الطلب</h3>
      <p className="mt-2 text-sm leading-6 text-[#6B7280]">
        التقييم يحدّث متوسط المنتج ومتوسط متجر المورد بعد اكتمال الطلب.
      </p>

      <div className="mt-4 flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className="text-amber-500"
            aria-label={`${value} stars`}
          >
            <Star
              size={24}
              fill={value <= rating ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="ملاحظتك عن المنتج أو المتجر..."
        className="mt-4 min-h-[90px] w-full rounded-[18px] border border-[#E5E7EB] p-4 text-sm outline-none focus:border-[var(--packora-blue)]"
      />

      <div className="mt-4 grid gap-2">
        {rateableItems.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={loading}
            onClick={() => item.productId && submitRating(item.productId)}
            className="rounded-full bg-[var(--packora-navy)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            تقييم {item.name}
          </button>
        ))}
      </div>

      {message ? (
        <p className="mt-3 rounded-[16px] border border-[#E5E7EB] p-3 text-sm font-semibold text-[#111827]">
          {message}
        </p>
      ) : null}
    </section>
  );
}
