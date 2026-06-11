import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // If no orders, redirect to register (first time user)
  if (orders.length === 0) {
    redirect("/register");
  }

  const buildStatusLabels: Record<string, string> = {
    awaiting_payment: "Menunggu Pembayaran",
    payment_confirmed: "Dikonfirmasi",
    designing: "Sedang Dibuat",
    review: "Review",
    done: "Live",
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      awaiting_payment: "bg-orange-100 text-orange-700 border-orange-200",
      payment_confirmed: "bg-blue-100 text-blue-700 border-blue-200",
      designing: "bg-purple-100 text-purple-700 border-purple-200",
      review: "bg-yellow-100 text-yellow-700 border-yellow-200",
      done: "bg-green-100 text-green-700 border-green-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-100 text-gray-600 border-gray-200",
      claimed: "bg-orange-100 text-orange-600 border-orange-200",
      paid: "bg-green-100 text-green-600 border-green-200",
    };
    return colors[status] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  // Group orders by month
  const groupedOrders = orders.reduce((acc, order) => {
    const monthYear = new Date(order.createdAt).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(order);
    return acc;
  }, {} as Record<string, typeof orders>);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-headline mb-2">Website Saya</h1>
          <p className="text-body text-neutral-600">
            Kelola semua website Anda di satu tempat
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5">
            <div className="text-xs sm:text-sm text-neutral-500 mb-1">Total Website</div>
            <div className="text-xl sm:text-2xl font-bold">{orders.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5">
            <div className="text-xs sm:text-sm text-neutral-500 mb-1">Live</div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {orders.filter((o) => o.buildStatus === "done").length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5">
            <div className="text-xs sm:text-sm text-neutral-500 mb-1">Progress</div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {orders.filter((o) => ["payment_confirmed", "designing", "review"].includes(o.buildStatus)).length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5">
            <div className="text-xs sm:text-sm text-neutral-500 mb-1">Perlu Aksi</div>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">
              {orders.filter((o) => o.buildStatus === "awaiting_payment" && o.paymentStatus === "pending").length}
            </div>
          </div>
        </div>

        {/* Orders List - Grouped by Month */}
        <div className="space-y-6 sm:space-y-8">
          {Object.entries(groupedOrders).map(([monthYear, monthOrders]) => (
            <div key={monthYear}>
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 sm:mb-4">
                {monthYear}
              </h3>

              <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
                {monthOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      {/* Left - Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <h4 className="text-base sm:text-lg font-semibold text-neutral-900 truncate">
                            {order.websiteName || "Website Baru"}
                          </h4>
                          <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(order.buildStatus)} w-fit whitespace-nowrap`}>
                            {buildStatusLabels[order.buildStatus]}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-sm text-neutral-600">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            <span className="truncate">{order.templateId}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="whitespace-nowrap">{order.billingCycle === "monthly" ? "Bulanan" : "Tahunan"}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="whitespace-nowrap">
                              {new Date(order.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>

                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)} whitespace-nowrap`}>
                            {order.paymentStatus === "pending" ? "Belum Bayar" : order.paymentStatus === "claimed" ? "Menunggu Konfirmasi" : "Lunas"}
                          </span>
                        </div>
                      </div>

                      {/* Right - Actions */}
                      <div className="flex items-center gap-2 sm:flex-shrink-0">
                        {order.buildStatus === "awaiting_payment" && order.paymentStatus === "pending" && (
                          <Link
                            href={`/payment/${order.id}`}
                            className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap"
                          >
                            Bayar Sekarang
                          </Link>
                        )}

                        {order.buildStatus === "done" && order.websiteUrl && (
                          <a
                            href={order.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 sm:gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all hover:-translate-y-0.5 whitespace-nowrap"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span className="hidden sm:inline">Buka Website</span>
                            <span className="sm:hidden">Buka</span>
                          </a>
                        )}

                        {(order.buildStatus === "payment_confirmed" || order.buildStatus === "designing" || order.buildStatus === "review") && (
                          <div className="text-xs sm:text-sm text-neutral-600 font-medium">
                            Sedang diproses
                          </div>
                        )}

                        {order.buildStatus === "awaiting_payment" && order.paymentStatus === "claimed" && (
                          <div className="text-xs sm:text-sm text-orange-600 font-medium">
                            Menunggu konfirmasi
                          </div>
                        )}

                        <button className="p-1.5 sm:p-2 hover:bg-neutral-100 rounded-lg transition-colors flex-shrink-0">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    {order.buildStatus !== "done" && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-neutral-100">
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <span>Progress:</span>
                          <div className="flex-1 bg-neutral-100 rounded-full h-1.5 max-w-xs">
                            <div
                              className="bg-gradient-to-r from-primary-500 to-accent-500 h-1.5 rounded-full transition-all"
                              style={{
                                width: `${
                                  order.buildStatus === "awaiting_payment"
                                    ? "20%"
                                    : order.buildStatus === "payment_confirmed"
                                    ? "40%"
                                    : order.buildStatus === "designing"
                                    ? "60%"
                                    : order.buildStatus === "review"
                                    ? "80%"
                                    : "100%"
                                }`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (in case all orders are hidden) */}
        {orders.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-title mb-2">Belum Ada Website</h3>
              <p className="text-body text-neutral-600 mb-6">
                Mulai buat website profesional pertama Anda
              </p>
              <Link href="/register" className="btn-primary inline-flex">
                Buat Website Baru
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
