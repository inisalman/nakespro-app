import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, Users, TrendingUp, ExternalLink, ArrowLeft } from "lucide-react";
import { getVisitorStats, getTopPages, getReferrers } from "@/lib/analytics";
import StatChart from "./_components/StatChart";

const RANGE_OPTIONS = [
  { value: "7", label: "7 hari" },
  { value: "30", label: "30 hari" },
  { value: "90", label: "90 hari" },
] as const;

type ValidRange = (typeof RANGE_OPTIONS)[number]["value"];

function parseRange(raw: string | string[] | undefined): ValidRange {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "7" || v === "30" || v === "90") return v;
  return "30";
}

function formatGrowth(pct: number): { text: string; color: string } {
  if (!isFinite(pct)) return { text: "Baru", color: "text-blue-600" };
  if (pct === 0) return { text: "0%", color: "text-neutral-500" };
  if (pct > 0) return { text: `+${pct}%`, color: "text-green-600" };
  return { text: `${pct}%`, color: "text-red-600" };
}

export default async function StatistikPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const params = await searchParams;
  const range = parseRange(params.range);
  const days = parseInt(range, 10);

  // Order utama user (subdomain yang di-track)
  const order = await prisma.order.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, subdomain: true, websiteName: true },
  });

  if (!order) redirect("/register");

  const [stats, topPages, topReferrers] = await Promise.all([
    getVisitorStats(order.id, days),
    getTopPages(order.id, days),
    getReferrers(order.id, days),
  ]);

  const growth = formatGrowth(stats.growthPct);
  const hasData = stats.total > 0;

  return (
    <div className="w-full flex-1 p-6 lg:p-10 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 mb-3"
        >
          <ArrowLeft size={16} />
          Kembali ke Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-display text-2xl lg:text-3xl font-bold text-neutral-900 mb-1">
              Statistik Kunjungan
            </h1>
            <p className="text-body text-neutral-500">
              Pantau performa website {order.websiteName || `${order.subdomain}.nakespro.id`}
            </p>
          </div>
          {/* Range filter */}
          <div className="inline-flex rounded-xl border border-neutral-200 bg-white p-1">
            {RANGE_OPTIONS.map((opt) => {
              const active = opt.value === range;
              return (
                <Link
                  key={opt.value}
                  href={`/dashboard/statistik?range=${opt.value}`}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? "bg-primary-600 text-white"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
            <BarChart3 className="text-primary-600" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Belum ada data kunjungan
          </h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
            Data akan muncul setelah website Anda menerima kunjungan pertama.
            Pastikan script tracking sudah terpasang di template.
          </p>
          {order.subdomain && (
            <a
              href={`https://${order.subdomain}.nakespro.id`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Buka Website
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      )}

      {/* KPI Cards */}
      {hasData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <BarChart3 className="text-blue-600" size={18} />
                </div>
                <p className="text-sm text-neutral-500">Total Kunjungan</p>
              </div>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.total.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-neutral-400 mt-1">{days} hari terakhir</p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <Users className="text-cyan-600" size={18} />
                </div>
                <p className="text-sm text-neutral-500">Pengunjung Unik</p>
              </div>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.unique.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-neutral-400 mt-1">Berdasarkan IP + UA hash</p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={18} />
                </div>
                <p className="text-sm text-neutral-500">Pertumbuhan</p>
              </div>
              <p className={`text-3xl font-bold ${growth.color}`}>{growth.text}</p>
              <p className="text-xs text-neutral-400 mt-1">vs {days} hari sebelumnya</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
            <h2 className="text-base font-semibold text-neutral-900 mb-4">
              Tren Kunjungan Harian
            </h2>
            <StatChart data={stats.daily} />
          </div>

          {/* Top Pages & Referrers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100">
                <h2 className="text-base font-semibold text-neutral-900">Halaman Teratas</h2>
              </div>
              {topPages.length === 0 ? (
                <p className="p-5 text-sm text-neutral-500">Belum ada data.</p>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {topPages.map((p, i) => (
                    <li key={p.key} className="flex items-center gap-3 px-5 py-3">
                      <span className="text-xs font-mono text-neutral-400 w-6">{i + 1}.</span>
                      <span className="flex-1 text-sm text-neutral-900 truncate font-mono">
                        {p.key}
                      </span>
                      <span className="text-sm text-neutral-600 tabular-nums">
                        {p.count.toLocaleString("id-ID")}
                      </span>
                      <span className="text-xs text-neutral-400 tabular-nums w-10 text-right">
                        {p.pct}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100">
                <h2 className="text-base font-semibold text-neutral-900">Sumber Trafik</h2>
              </div>
              {topReferrers.length === 0 ? (
                <p className="p-5 text-sm text-neutral-500">Belum ada data.</p>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {topReferrers.map((r, i) => (
                    <li key={r.key} className="flex items-center gap-3 px-5 py-3">
                      <span className="text-xs font-mono text-neutral-400 w-6">{i + 1}.</span>
                      <span className="flex-1 text-sm text-neutral-900 truncate">
                        {r.key}
                      </span>
                      <span className="text-sm text-neutral-600 tabular-nums">
                        {r.count.toLocaleString("id-ID")}
                      </span>
                      <span className="text-xs text-neutral-400 tabular-nums w-10 text-right">
                        {r.pct}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
