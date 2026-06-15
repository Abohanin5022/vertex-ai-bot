type PriceProps = {
  amount: number | string;
  className?: string;
  symbolClassName?: string;
  iconClassName?: string;
  maximumFractionDigits?: number;
};

const numberFormatter = new Intl.NumberFormat("ar-SA", {
  maximumFractionDigits: 2,
});

export function Price({
  amount,
  className = "text-base font-semibold text-[var(--packora-blue)]",
  symbolClassName,
  iconClassName,
  maximumFractionDigits,
}: PriceProps) {
  const formatted =
    typeof amount === "number"
      ? new Intl.NumberFormat("ar-SA", {
          maximumFractionDigits:
            maximumFractionDigits ?? (Number.isInteger(amount) ? 0 : 2),
        }).format(amount)
      : amount;

  return (
    <span
      className={`inline-flex items-center gap-1 align-middle ${className}`}
      dir="rtl"
    >
      <span>{formatted}</span>
      <span
        aria-label="ريال سعودي"
        className={`leading-none ${symbolClassName || iconClassName || ""}`}
      >
        ﷼
      </span>
    </span>
  );
}

export function formatPriceValue(amount: number) {
  return numberFormatter.format(amount);
}
