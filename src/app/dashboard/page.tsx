import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Globe, Users, CreditCard, FileText, Edit, ExternalLink, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  // Get user's primary website order
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 1, // Get the latest order as the primary website for now
  });

  // If no orders, redirect to register (first time user)
  if (orders.length === 0) {
    redirect("/register");
  }

  const primaryOrder = orders[0];
  const isWebsiteLive = primaryOrder.buildStatus === "done";

  // Dummy data for analytics and subscription (to match specification)
  // TODO: Replace with real analytics API integration
  const analyticsData = {
    visitorsThisMonth: 124,
    growthPercentage: 12, // +12%
  };

  // Derive subscription data based on order
  const subscriptionEndDate = primaryOrder.nextBillingDate
    ? new Date(primaryOrder.nextBillingDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    : "12 Agustus 2027"; // Fallback dummy as requested if null

  const websiteUrl = primaryOrder.websiteUrl || `https://${primaryOrder.subdomain}.nakespro.id`;

  return (
    <div className="w-full flex-1 p-6 lg:p-10 max-w-7xl mx-auto animate-fade-in-up">
      {/* 1. Header Section */}
      <div className="mb-10">
        <h1 className="text-display text-3xl font-bold text-neutral-900 mb-2">
          Halo, {session.user.name?.split(" ")[0] || "Nakes"} 👋
        </h1>
        <p className="text-body text-neutral-500 max-w-2xl">
          Selamat datang di NakesPro. Berikut adalah ringkasan performa website dan operasional Anda.
        </p>
      </div>

      {/* 2. Top Grid (3 Kartu Status Utama) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

        {/* Kartu 1: Status Website */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Globe className="text-primary-600" size={20} />
            </div>
            {isWebsiteLive ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Live
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                Sedang Diproses
              </span>
            )}
          </div>
          <div className="mt-auto">
            <p className="text-sm font-medium text-neutral-500 mb-1">Status Website</p>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              {isWebsiteLive ? "Website Online" : "Dalam Pengerjaan"}
            </h3>

            {isWebsiteLive ? (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors group"
              >
                <span className="text-sm text-primary-700 truncate mr-2 font-medium">
                  {websiteUrl.replace(/^https?:\/\//, '')}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 group-hover:text-primary-800 shrink-0">
                  Buka Website
                  <ExternalLink size={14} />
                </span>
              </a>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <div className="w-full bg-neutral-200 rounded-full h-1.5">
                  <div className="bg-primary-500 h-1.5 rounded-full w-[60%]"></div>
                </div>
                <span className="text-xs font-medium text-neutral-600">60%</span>
              </div>
            )}
          </div>
        </div>

        {/* Kartu 2: Statistik Singkat */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
              <Users className="text-teal-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="text-sm font-medium text-neutral-500 mb-1">Pengunjung Bulan Ini</p>
            <div className="flex items-baseline gap-3 mb-4">
              <h3 className="text-3xl font-bold text-neutral-900">
                {analyticsData.visitorsThisMonth} <span className="text-lg font-semibold text-neutral-500">Orang</span>
              </h3>
            </div>

            <div className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
              <div className="flex items-center text-green-600 text-sm font-medium">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                +{analyticsData.growthPercentage}%
              </div>
              <span className="text-xs text-neutral-500">dari bulan lalu</span>
            </div>
          </div>
        </div>

        {/* Kartu 3: Status Langganan */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <CreditCard className="text-indigo-600" size={20} />
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
              Aktif
            </span>
          </div>
          <div className="mt-auto">
            <p className="text-sm font-medium text-neutral-500 mb-1">Paket {primaryOrder.packageType === "hemat" ? "Starter" : "Profesional"}</p>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              {primaryOrder.billingCycle === "monthly" ? "Bulanan" : "Tahunan"}
            </h3>

            <div className="flex items-center p-3 bg-neutral-50 rounded-lg border border-neutral-100">
              <span className="text-sm text-neutral-600">
                Berakhir pada <strong className="text-neutral-900 font-semibold">{subscriptionEndDate}</strong>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Bottom Section (Akses Cepat) */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          Akses Cepat
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Link
            href="/dashboard/laporan"
            className="group relative bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
              <FileText className="text-primary-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">
                Buat Laporan & Invoice Baru
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">Generate PDF untuk pasien</p>
            </div>
            <ArrowRight className="text-neutral-300 group-hover:text-primary-500 transition-colors shrink-0" size={20} />
          </Link>

          <Link
            href="/dashboard/profil"
            className="group relative bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
              <Edit className="text-orange-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-neutral-900 group-hover:text-orange-700 transition-colors">
                Edit Profil & Layanan
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">Ubah data di website Anda</p>
            </div>
            <ArrowRight className="text-neutral-300 group-hover:text-orange-500 transition-colors shrink-0" size={20} />
          </Link>

        </div>
      </div>

    </div>
  );
}
