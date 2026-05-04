export type MetricRow = {
  ts: string;
  method: string;
  path: string;
  status: number;
  ms: number;
};

const g = globalThis as unknown as { __astroReqMetrics?: MetricRow[] };

function buffer(): MetricRow[] {
  if (!g.__astroReqMetrics) g.__astroReqMetrics = [];
  return g.__astroReqMetrics;
}

export function pushRequestMetric(row: MetricRow): void {
  const b = buffer();
  b.push(row);
  while (b.length > 100) b.shift();
}

export function getRecentRequestMetrics(): MetricRow[] {
  return [...buffer()].reverse();
}

const g2 = globalThis as unknown as { __astroStart?: number };

export function getProcessStartTime(): number {
  if (g2.__astroStart == null) g2.__astroStart = Date.now();
  return g2.__astroStart;
}
