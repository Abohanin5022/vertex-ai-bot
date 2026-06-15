"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { Package } from "lucide-react";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean;
};

function normalizeImageSrc(src?: string | null) {
  const trimmed = src?.trim();

  if (!trimmed) {
    return "";
  }

  try {
    return encodeURI(trimmed);
  } catch {
    return trimmed;
  }
}

export function ProductImage({
  src,
  alt,
  className,
  fallbackClassName,
  priority = false,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const imageSrc = useMemo(() => normalizeImageSrc(src), [src]);

  if (!imageSrc || failed) {
    return (
      <div
        className={
          fallbackClassName ||
          "grid h-full w-full place-items-center bg-[#F8FAFC] text-5xl"
        }
      >
        <Package aria-label="بدون صورة" size={44} strokeWidth={1.7} />
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
