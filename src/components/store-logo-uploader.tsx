"use client";

import Image from "next/image";
import { type ChangeEvent, useState } from "react";
import { Store } from "lucide-react";

export function StoreLogoUploader({
  defaultValue,
}: {
  defaultValue?: string | null;
}) {
  const [logoUrl, setLogoUrl] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload-logo", {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "تعذر رفع الشعار");
      return;
    }

    const data = await response.json();
    setLogoUrl(data.url);
  }

  return (
    <div className="rounded-[22px] border border-[#E5E7EB] bg-white p-4">
      <p className="text-sm font-semibold text-[#111827]">شعار المتجر</p>

      <div className="mt-4 flex items-center gap-4">
        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-[#E5E7EB] bg-[#F8FAFC]">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Store Logo"
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <Store size={30} strokeWidth={1.7} />
          )}
        </div>

        <label className="cursor-pointer rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white">
          {uploading ? "جاري الرفع..." : "رفع شعار"}
          <input
            type="file"
            accept="image/*"
            onChange={uploadLogo}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {error ? (
        <p className="mt-3 rounded-[16px] border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600">
          {error}
        </p>
      ) : null}

      <input type="hidden" name="storeLogo" value={logoUrl} />
    </div>
  );
}
