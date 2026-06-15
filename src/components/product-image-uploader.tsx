"use client";

import { type ChangeEvent, useState } from "react";
import { ImageUp, Package } from "lucide-react";
import { genUploader } from "uploadthing/client";
import { ProductImage } from "@/components/product-image";
import type { OurFileRouter } from "@/src/app/api/uploadthing/core";

const { uploadFiles } = genUploader<OurFileRouter>();

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("تعذر قراءة ملف الصورة"));
    };

    reader.onerror = () => reject(new Error("تعذر قراءة ملف الصورة"));
    reader.readAsDataURL(file);
  });
}

async function compressImageToDataUrl(file: File) {
  const originalDataUrl = await readFileAsDataUrl(file);

  return new Promise<string>((resolve) => {
    const image = new Image();

    image.onload = () => {
      const maxSize = 900;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        resolve(originalDataUrl);
        return;
      }

      canvas.width = width;
      canvas.height = height;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };

    image.onerror = () => resolve(originalDataUrl);
    image.src = originalDataUrl;
  });
}

async function uploadWithLocalApi(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload-product-image", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as {
    url?: string;
    error?: string;
    details?: string;
  } | null;

  if (!response.ok) {
    throw new Error(data?.details || data?.error || "تعذر رفع الصورة محليًا");
  }

  if (!data?.url) {
    throw new Error("لم يرجع رابط الصورة من الخادم المحلي");
  }

  return data.url;
}

async function uploadProductImage(file: File) {
  try {
    const [uploaded] = await uploadFiles("imageUploader", {
      files: [file],
    });

    const url =
      uploaded?.serverData?.url ||
      uploaded?.url ||
      uploaded?.ufsUrl ||
      uploaded?.appUrl;

    if (!url) {
      throw new Error("لم يرجع رابط الصورة من خدمة الرفع");
    }

    return url;
  } catch {
    if (process.env.NODE_ENV === "development") {
      try {
        return await uploadWithLocalApi(file);
      } catch {
        return compressImageToDataUrl(file);
      }
    }

    return compressImageToDataUrl(file);
  }
}

export function ProductImageUploader({
  defaultValue = "",
}: {
  defaultValue?: string | null;
}) {
  const [imageUrl, setImageUrl] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);

    try {
      const url = await uploadProductImage(file);
      setImageUrl(url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "خطأ غير معروف";

      alert(`تعذر تجهيز الصورة: ${message}`);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="rounded-[24px] border border-[var(--packora-border)] bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--packora-navy)]">
            صورة المنتج
          </p>
          <p className="mt-1 text-xs leading-6 text-[#6B7280]">
            ارفع صورة واضحة للمنتج. سيتم حفظ رابطها تلقائيًا.
          </p>
        </div>

        <label className="shrink-0 cursor-pointer rounded-full bg-[var(--packora-navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--packora-orange)]">
          {uploading ? "جاري الرفع..." : "رفع صورة المنتج"}
          <input
            type="file"
            accept="image/*"
            onChange={uploadImage}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <label className="mt-4 grid h-56 cursor-pointer place-items-center overflow-hidden rounded-[22px] border border-[var(--packora-border)] bg-[#F8FAFC] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--packora-orange)] hover:shadow-[0_18px_42px_rgba(249,115,22,0.18)]">
        {imageUrl ? (
          <ProductImage
            src={imageUrl}
            alt="Product preview"
            className="h-full w-full object-contain p-4"
            fallbackClassName="grid h-full w-full place-items-center text-4xl"
          />
        ) : (
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[var(--packora-border)] bg-white text-[#6B7280]">
              <Package size={30} strokeWidth={1.7} />
            </div>
            <p className="mt-3 text-sm font-semibold text-[#6B7280]">
              اضغط هنا لاختيار الصورة
            </p>
            <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[var(--packora-orange)]">
              <ImageUp size={14} />
              اختيار ملف
            </p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={uploadImage}
          disabled={uploading}
          className="hidden"
        />
      </label>

      <input type="hidden" name="image" value={imageUrl} />
    </div>
  );
}
