import { NextRequest, NextResponse } from "next/server";
import { recordWebVitalMetric } from "@/lib/metrics-store";

const VALID_RATINGS = new Set(["good", "needs-improvement", "poor"]);

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.name !== "string" ||
    typeof body.value !== "number" ||
    !VALID_RATINGS.has(body.rating)
  ) {
    return NextResponse.json({ error: "Invalid metric payload." }, { status: 400 });
  }

  recordWebVitalMetric({
    name: body.name,
    value: body.value,
    rating: body.rating,
  });

  return NextResponse.json({ ok: true });
}
