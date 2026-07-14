"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Silently reports Core Web Vitals (LCP, INP, CLS, ...) from the real
 * visitor's browser to /api/metrics, which feeds the /performance page.
 * Renders nothing — mount once near the root layout.
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
      }),
      keepalive: true,
    }).catch(() => {
      // Best-effort only: losing a metrics ping should never affect UX.
    });
  });

  return null;
}
