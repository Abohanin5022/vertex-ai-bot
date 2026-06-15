import { ProductSkeleton } from "@/components/product-skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F7F1E8] p-4">
      <div className="mx-auto max-w-md">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
