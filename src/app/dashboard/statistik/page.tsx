import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Users,
  Eye,
  MousePointerClick,
  TrendingUp,
  Calendar,
  Globe,
  Monitor,
} from "lucide-react";

export default async function StatistikPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  // Ambil order user (website client NakesPro)
  const order = await prisma.order.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!order || !order.subdomain) {
    return (
      <div className="w-full flex-1 p-6 lg:p-10 max-w-7xl mx-auto">
        <div className="text-center py-20">
          <BarChart3 className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            Belum Ada Data Statistik
          </h2>
          <p className="text-neutral-500">
            Website Anda belum aktif atau belum memiliki subdomain.
          </p>
        </div>
      </div>
    );
  }

  const siteId = order.subdomain;

  // === Query data statistik ===
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalVisitors,
    todayVisitors,
    monthVisitors,
    unique30d,
    topPages,
    topReferrers,
    dailyStats,
    recentVisits,
  ] = await Promise.all([
    // Total all-time
    prisma.trackingEvent.count({ where: { siteId } }),
    // Hari ini
    prisma.trackingEvent.count({
      where: { siteId, createdAt: { gte: todayStart } },
    }),
    // Bulan ini
    prisma.trackingEvent.count({
      where: { siteId, createdAt: { gte: monthStart } },
    }),
    // Unique visitors 30 hari (based on IP)
    prisma.trackingEvent.groupBy({
      by: ["ipAddress"],
      where: { siteId, createdAt: { gte: last30Days }, ipAddress: { not: null } },
      _count: true,
    }),
    // Top pages
    prisma.trackingEvent.groupBy({
      by: ["url"],
      where: { siteId, createdAt: { gte: last30Days } },
      _count: true,
      orderBy: { _count: { url: "desc" } },
      take: 10,
    }),
    // Top referrers
    prisma.trackingEvent.groupBy({
      by: ["referrer"],
      where: {
        siteId,
        createdAt: { gte: last30Days },
        referrer: { not: null },
      },
      _count: true,
      orderBy: { _count: { referrer: "desc" } },
      take: 10,
    }),
    // Daily visitors for chart (last 14 days)
    prisma.$queryRawUnsafe<Array<{ date: string; count: bigint }>>(
      `SELECT DATE("createdAt") as date, COUNT(*)::int as count
       FROM "TrackingEvent"
       WHERE "siteId" = $1 AND "createdAt" >= $2
       GROUP BY DATE("createdAt")
       ORDER BY date ASC`,
      siteId,
      last30Days,
    ),
    // Recent visits
    prisma.trackingEvent.findMany({
      where: { siteId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const uniqueCount = unique30d.length;

  // Build date labels for chart
  const chartData: Record<string, number> = {};
  if (Array.isArray(dailyStats)) {
    for (const row of dailyStats) {
      const d = typeof row.date === "string" ? row.date : new Date(row.date).toISOString().split("T")[0];
      chartData[d] = Number(row.count);
    }
  }

  // Generate last 14 days labels
  const days: string[] = [];
  const counts: number[] = [];
  let maxCount = 0;
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    days.push(label);
    const c = chartData[key] || 0;
    counts.push(c);
    if (c > maxCount) maxCount = c;
  }

  const formatDate = (d: Date) =>
    d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="w-full flex-1 p-6 lg:p-10 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="text-primary-600" size={24} />
          <h1 className="text-display text-2xl lg:text-3xl font-bold text-neutral-900">
            Statistik Website
          </h1>
        </div>
        <p className="text-body text-neutral-500">{order.subdomain}.nakespro.id</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Eye className="w-5 h-5" />}
          label="Total Kunjungan"
          value={totalVisitors.toLocaleString("id-ID")}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Hari Ini"
          value={todayVisitors.toLocaleString("id-ID")}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Bulan Ini"
          value={monthVisitors.toLocaleString("id-ID")}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Pengunjung Unik (30hr)"
          value={uniqueCount.toLocaleString("id-ID")}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">
            Kunjungan 14 Hari Terakhir
          </h2>
          {maxCount === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">
              Belum ada data kunjungan
            </p>
          ) : (
            <div className="flex items-end gap-1.5 h-32">
              {counts.map((c, i) => {
                const pct = maxCount > 0 ? (c / maxCount) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-neutral-500">
                      {c || ""}
                    </span>
                    <div
                      className="w-full bg-primary-500 rounded-t-md transition-all hover:bg-primary-600"
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    />
                    <span className="text-[9px] text-neutral-400 rotate-45 origin-left whitespace-nowrap">
                      {days[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Referrers */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">
            <Globe className="w-4 h-4 inline mr-1.5 text-neutral-400" />
            Top Rujukan
          </h2>
          {topReferrers.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">
              Belum ada data
            </p>
          ) : (
            <div className="space-y-2">
              {topReferrers.map((r, i) => {
                const ref = r.referrer || "(direct)";
                const domain = ref.replace(/^https?:\/\//, "").split("/")[0];
                return (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-700 truncate max-w-[160px]">
                      {domain.length > 20 ? domain.slice(0, 20) + ".." : domain}
                    </span>
                    <span className="text-neutral-900 font-semibold ml-2">
                      {r._count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Pages */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">
            <Monitor className="w-4 h-4 inline mr-1.5 text-neutral-400" />
            Halaman Terpopuler
          </h2>
          {topPages.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">
              Belum ada data
            </p>
          ) : (
            <div className="space-y-2">
              {topPages.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700 truncate max-w-[220px]">
                    {p.url.length > 40 ? p.url.slice(0, 40) + ".." : p.url}
                  </span>
                  <span className="text-neutral-900 font-semibold ml-2">{p._count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Visits */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">
            <MousePointerClick className="w-4 h-4 inline mr-1.5 text-neutral-400" />
            Kunjungan Terbaru
          </h2>
          {recentVisits.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">
              Belum ada kunjungan
            </p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {recentVisits.map((v) => (
                <div
                  key={v.id}
                  className="flex items-start justify-between text-sm py-1.5 border-b border-neutral-50 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-neutral-900 font-medium truncate">
                      {v.title || v.url}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {v.url.length > 50 ? v.url.slice(0, 50) + ".." : v.url}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400 ml-3 whitespace-nowrap">
                    {formatDate(v.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-sm text-neutral-500 mt-1">{label}</p>
    </div>
  );
}
