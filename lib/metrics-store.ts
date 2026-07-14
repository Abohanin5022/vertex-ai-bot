// In-memory ring buffer for lightweight app-speed monitoring.
// This intentionally avoids a database/analytics dependency: it tracks
// the last N measurements per source so the /performance page can show
// a live read on how fast product data loads and how the client-side
// experience is performing (Core Web Vitals), without adding infra.

const MAX_ENTRIES = 30;

export type FetchMetric = {
  timestamp: number;
  durationMs: number;
  source: "supabase" | "fallback";
};

export type WebVitalMetric = {
  timestamp: number;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
};

const fetchMetrics: FetchMetric[] = [];
const webVitalMetrics: WebVitalMetric[] = [];

function pushBounded<T>(list: T[], entry: T) {
  list.push(entry);
  if (list.length > MAX_ENTRIES) {
    list.shift();
  }
}

export function recordFetchMetric(entry: Omit<FetchMetric, "timestamp">) {
  pushBounded(fetchMetrics, { ...entry, timestamp: Date.now() });
}

export function recordWebVitalMetric(entry: Omit<WebVitalMetric, "timestamp">) {
  pushBounded(webVitalMetrics, { ...entry, timestamp: Date.now() });
}

export function getFetchMetrics(): FetchMetric[] {
  return [...fetchMetrics];
}

export function getWebVitalMetrics(): WebVitalMetric[] {
  return [...webVitalMetrics];
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
