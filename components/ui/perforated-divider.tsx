export function PerforatedDivider({
  orientation = "horizontal",
  className = "",
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  if (orientation === "vertical") {
    return <div className={`perforated-v w-px ${className}`} />;
  }

  return <div className={`perforated h-px ${className}`} />;
}
