import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  compact?: boolean;
};

export function BrandMark({ href = "/packora-1", compact = false }: BrandMarkProps) {
  const content = (
    <div className="flex items-center justify-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-lg font-black text-white shadow-sm">
        P
      </div>

      {!compact ? (
        <div className="text-right">
          <p className="text-xl font-black leading-none text-[#1F2937]">
            Packora
          </p>
          <p className="mt-1 text-[11px] font-bold text-[#2563EB]">
            تغليف المملكة
          </p>
        </div>
      ) : null}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
