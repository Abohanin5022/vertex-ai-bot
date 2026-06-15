import { Suspense } from "react";
import { OrderTracker } from "./order-tracker";

export const dynamic = "force-dynamic";

export default function TrackPage() {
  return (
    <Suspense>
      <OrderTracker />
    </Suspense>
  );
}
