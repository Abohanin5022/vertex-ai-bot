import {
  average,
  getFetchMetrics,
  getWebVitalMetrics,
} from "@/lib/metrics-store";
import { PerforatedDivider } from "@/components/ui/perforated-divider";
import { StampBadge } from "@/components/ui/stamp-badge";

export const dynamic = "force-dynamic";

const VITAL_LABELS: Record<string, string> = {
  LCP: "أكبر عنصر مرئي (LCP)",
  INP: "زمن الاستجابة للتفاعل (INP)",
  CLS: "ثبات التخطيط (CLS)",
  FCP: "أول رسم للمحتوى (FCP)",
  TTFB: "زمن أول بايت (TTFB)",
};

function ratingTone(rating: string): "ok" | "alert" {
  return rating === "good" ? "ok" : "alert";
}

function ratingLabel(rating: string): string {
  if (rating === "good") return "جيد";
  if (rating === "needs-improvement") return "يحتاج تحسين";
  return "ضعيف";
}

export default function PerformancePage() {
  const fetchMetrics = getFetchMetrics();
  const webVitals = getWebVitalMetrics();

  const avgLatency = average(fetchMetrics.map((entry) => entry.durationMs));
  const maxLatency = Math.max(
    ...fetchMetrics.map((entry) => entry.durationMs),
    1,
  );

  const latestVitalByName = new Map<string, (typeof webVitals)[number]>();
  for (const vital of webVitals) {
    latestVitalByName.set(vital.name, vital);
  }

  return (
    <div>
      <header className="pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-tape-deep">
          مراقبة الأداء
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-normal">
          سرعة التطبيق
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          قياسات مباشرة من هذه الجلسة: زمن جلب بيانات المنتجات من الخادم،
          ومؤشرات الأداء الأساسية (Core Web Vitals) من متصفحك.
        </p>
      </header>

      <PerforatedDivider />

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-sm border border-hairline bg-paper p-4">
          <h3 className="font-bold">زمن جلب المنتجات (آخر {fetchMetrics.length} طلب)</h3>

          {fetchMetrics.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">
              لا توجد بيانات بعد — حمّل الصفحة الرئيسية أو صفحة المنتجات أولًا.
            </p>
          ) : (
            <>
              <div className="mt-4 flex items-end gap-1" style={{ height: 120 }}>
                {fetchMetrics.map((entry, index) => (
                  <div
                    key={`${entry.timestamp}-${index}`}
                    className={`flex-1 rounded-t-sm ${
                      entry.source === "supabase" ? "bg-manifest-cyan" : "bg-tape"
                    }`}
                    style={{
                      height: `${Math.max((entry.durationMs / maxLatency) * 100, 4)}%`,
                    }}
                    title={`${entry.durationMs.toFixed(0)} ms — ${entry.source}`}
                  />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-6 font-mono text-sm text-ink-soft">
                <span>
                  المتوسط:{" "}
                  <strong className="text-ink">{avgLatency.toFixed(0)} ms</strong>
                </span>
                <span>
                  الأعلى:{" "}
                  <strong className="text-ink">{maxLatency.toFixed(0)} ms</strong>
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-manifest-cyan" />
                  Supabase
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-tape" />
                  بيانات احتياطية
                </span>
              </div>
            </>
          )}
        </div>

        <div className="rounded-sm border border-hairline bg-paper p-4">
          <h3 className="font-bold">Core Web Vitals</h3>
          <p className="mt-1 text-sm text-ink-soft">
            تُرسل تلقائيًا من متصفحك أثناء التصفح.
          </p>

          <div className="mt-4 space-y-3">
            {latestVitalByName.size === 0 ? (
              <p className="text-sm text-ink-soft">
                لا توجد قياسات بعد — تصفّح الموقع قليلًا ثم أعد تحميل هذه
                الصفحة.
              </p>
            ) : (
              Array.from(latestVitalByName.values()).map((vital) => (
                <div
                  key={vital.name}
                  className="flex items-center justify-between rounded-sm border border-hairline px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {VITAL_LABELS[vital.name] ?? vital.name}
                    </p>
                    <p className="font-mono text-xs text-ink-soft">
                      {vital.value.toFixed(vital.name === "CLS" ? 3 : 0)}
                      {vital.name === "CLS" ? "" : " ms"}
                    </p>
                  </div>
                  <StampBadge
                    label={ratingLabel(vital.rating)}
                    tone={ratingTone(vital.rating)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
