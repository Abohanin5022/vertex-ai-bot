export function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-[#E2D2BD] bg-[#FFFDF8]">
      <div className="h-40 bg-[#E2D2BD]" />

      <div className="p-4">
        <div className="h-3 w-20 rounded bg-[#E2D2BD]" />

        <div className="mt-3 h-5 w-full rounded bg-[#E2D2BD]" />

        <div className="mt-2 h-5 w-2/3 rounded bg-[#E2D2BD]" />

        <div className="mt-5 flex items-center justify-between">
          <div className="h-6 w-20 rounded bg-[#E2D2BD]" />

          <div className="h-10 w-10 rounded-lg bg-[#E2D2BD]" />
        </div>
      </div>
    </div>
  );
}
