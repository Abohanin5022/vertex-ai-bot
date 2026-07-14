type StampTone = "ok" | "alert";

const toneStyles: Record<StampTone, string> = {
  ok: "border-manifest-cyan text-manifest-cyan",
  alert: "border-stamp-red text-stamp-red",
};

/**
 * A status badge styled like an ink rubber-stamp: rotated slightly,
 * double-ruled border, uppercase-tracked label. Used anywhere a
 * product or metric needs a pass/fail read at a glance.
 */
export function StampBadge({
  label,
  tone,
}: {
  label: string;
  tone: StampTone;
}) {
  return (
    <span
      className={`inline-block -rotate-2 rounded-sm border-2 px-2 py-0.5 text-xs font-bold tracking-wide ${toneStyles[tone]}`}
      style={{
        boxShadow: "inset 0 0 0 1px currentColor",
      }}
    >
      {label}
    </span>
  );
}
