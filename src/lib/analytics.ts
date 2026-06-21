/**
 * Server-only aggregation untuk statistik kunjungan website client.
 * Dipakai oleh /dashboard (kartu ringkas) dan /dashboard/statistik (detail).
 */
import "server-only";
import { prisma } from "@/lib/prisma";

// --- Types ---

export type DailyStat = {
  date: string; // YYYY-MM-DD
  total: number;
  unique: number;
};

export type KpiSummary = {
  total: number;
  unique: number;
  growthPct: number; // -100..Infinity. Infinity jika previous=0 dan current>0.
};

export type TopEntry = {
  key: string;
  count: number;
  pct: number; // 0..100
};

export type VisitorStats = {
  total: number;
  unique: number;
  growthPct: number;
  daily: DailyStat[];
};

// --- Cache (5 menit per orderId+days) ---

type CacheKey = string;
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<CacheKey, { at: number; value: unknown }>();

async function cached<T>(key: CacheKey, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.value as T;
  }
  const value = await loader();
  cache.set(key, { at: Date.now(), value });
  return value;
}

// --- Date helpers (Asia/Jakarta) ---

const TZ = "Asia/Jakarta";

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function isoDate(d: Date): string {
  // YYYY-MM-DD in Asia/Jakarta
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${day}`;
}

function rangeFromDays(days: number): { start: Date; end: Date; previousStart: Date } {
  const now = new Date();
  const end = startOfDay(addDays(now, 1)); // exclusive upper bound: besok 00:00
  const start = addDays(end, -days);
  const previousStart = addDays(start, -days);
  return { start, end, previousStart };
}

function calcGrowthPct(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : Infinity;
  }
  return Math.round(((current - previous) / previous) * 100);
}

// --- Public API ---

/**
 * KPI untuk kartu ringkas di /dashboard.
 * Window 30 hari. "Bulan lalu" = 30 hari sebelumnya.
 */
export async function getMonthlyKpi(orderId: string): Promise<KpiSummary> {
  return cached(`kpi:30:${orderId}`, async () => {
    const { start, end, previousStart } = rangeFromDays(30);
    const [current, previous] = await Promise.all([
      aggregateTotals(orderId, start, end),
      aggregateTotals(orderId, previousStart, start),
    ]);
    return {
      total: current.total,
      unique: current.unique,
      growthPct: calcGrowthPct(current.total, previous.total),
    };
  });
}

/**
 * Statistik lengkap untuk /dashboard/statistik.
 * `days` harus 7, 30, atau 90 (validasi di page).
 */
export async function getVisitorStats(
  orderId: string,
  days: number
): Promise<VisitorStats> {
  return cached(`stats:${days}:${orderId}`, async () => {
    const { start, end, previousStart } = rangeFromDays(days);
    const [current, previous, daily] = await Promise.all([
      aggregateTotals(orderId, start, end),
      aggregateTotals(orderId, previousStart, start),
      aggregateDaily(orderId, start, end),
    ]);
    return {
      total: current.total,
      unique: current.unique,
      growthPct: calcGrowthPct(current.total, previous.total),
      daily,
    };
  });
}

export async function getTopPages(
  orderId: string,
  days: number,
  limit = 10
): Promise<TopEntry[]> {
  return cached(`pages:${days}:${orderId}`, async () => {
    const { start, end } = rangeFromDays(days);
    const rows = await prisma.pageView.groupBy({
      by: ["path"],
      where: { orderId, createdAt: { gte: start, lt: end } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: limit,
    });
    const total = rows.reduce((s, r) => s + r._count.path, 0);
    return rows.map((r) => ({
      key: r.path,
      count: r._count.path,
      pct: total === 0 ? 0 : Math.round((r._count.path / total) * 100),
    }));
  });
}

export async function getReferrers(
  orderId: string,
  days: number,
  limit = 10
): Promise<TopEntry[]> {
  return cached(`refs:${days}:${orderId}`, async () => {
    const { start, end } = rangeFromDays(days);
    // referrer = NULL dihitung sebagai "Direct". Pakai raw untuk handle null.
    const raw = await prisma.$queryRaw<
      Array<{ referrer: string | null; count: bigint }>
    >`
      SELECT "referrer", COUNT(*)::bigint as count
      FROM "PageView"
      WHERE "orderId" = ${orderId}
        AND "createdAt" >= ${start}
        AND "createdAt" < ${end}
      GROUP BY "referrer"
      ORDER BY count DESC
      LIMIT ${limit}
    `;
    const rows = raw.map((r) => ({ key: r.referrer, count: Number(r.count) }));
    const total = rows.reduce((s, r) => s + r.count, 0);
    return rows.map((r) => ({
      key: r.key ?? "(Direct)",
      count: r.count,
      pct: total === 0 ? 0 : Math.round((r.count / total) * 100),
    }));
  });
}

// --- Internal aggregations ---

async function aggregateTotals(
  orderId: string,
  start: Date,
  end: Date
): Promise<{ total: number; unique: number }> {
  const rows = await prisma.$queryRaw<Array<{ total: bigint; unique: bigint }>>`
    SELECT
      COUNT(*)::bigint as total,
      COUNT(DISTINCT "visitorHash")::bigint as unique
    FROM "PageView"
    WHERE "orderId" = ${orderId}
      AND "createdAt" >= ${start}
      AND "createdAt" < ${end}
  `;
  const row = rows[0] ?? { total: BigInt(0), unique: BigInt(0) };
  return { total: Number(row.total), unique: Number(row.unique) };
}

async function aggregateDaily(
  orderId: string,
  start: Date,
  end: Date
): Promise<DailyStat[]> {
  const rows = await prisma.$queryRaw<
    Array<{ date: string; total: bigint; unique: bigint }>
  >`
    SELECT
      TO_CHAR("createdAt" AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') as date,
      COUNT(*)::bigint as total,
      COUNT(DISTINCT "visitorHash")::bigint as unique
    FROM "PageView"
    WHERE "orderId" = ${orderId}
      AND "createdAt" >= ${start}
      AND "createdAt" < ${end}
    GROUP BY date
    ORDER BY date ASC
  `;
  // Isi hari kosong dengan 0 supaya chart continuous.
  const map = new Map(rows.map((r) => [r.date, Number(r.total)]));
  const uniqueMap = new Map(rows.map((r) => [r.date, Number(r.unique)]));
  const out: DailyStat[] = [];
  const cursor = new Date(start);
  while (cursor < end) {
    const d = isoDate(cursor);
    out.push({ date: d, total: map.get(d) ?? 0, unique: uniqueMap.get(d) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}
