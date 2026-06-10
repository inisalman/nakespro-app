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

  const buildStatusLabels: Record<string, string> = {
    awaiting_payment: "Menunggu Pembayaran",
    payment_confirmed: "Pembayaran Dikonfirmasi",
    designing: "Website Sedang Dibuat",
    review: "Siap Direview",
    done: "Website Live ✓",
  };

  const getStepStatus = (orderStatus: string, stepStatus: string) => {
    const statusOrder = [
      "awaiting_payment",
      "payment_confirmed",
      "designing",
      "review",
      "done",
    ];
    const currentIndex = statusOrder.indexOf(orderStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Selamat datang, {session.user.name}!
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Belum Ada Pesanan
            </h2>
            <p className="text-gray-600 mb-6">
              Mulai buat website profesional untuk praktik Anda
            </p>
            <Link
              href="/register"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Mulai Pesan Website
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                {/* Header */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {order.websiteName || "Website Baru"}
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      {order.templateId}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                      {order.billingCycle === "monthly"
                        ? "Bulanan"
                        : "Tahunan"}
                    </span>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Progress:
                  </h4>
                  <div className="space-y-3">
                    {[
                      "awaiting_payment",
                      "payment_confirmed",
                      "designing",
                      "review",
                      "done",
                    ].map((status) => {
                      const stepStatus = getStepStatus(
                        order.buildStatus,
                        status
                      );
                      return (
                        <div key={status} className="flex items-center gap-3">
                          {stepStatus === "completed" && (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                          {stepStatus === "active" && (
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex-shrink-0"></div>
                          )}
                          {stepStatus === "pending" && (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                          )}
                          <span
                            className={`text-sm ${
                              stepStatus === "active"
                                ? "font-semibold text-gray-900"
                                : stepStatus === "completed"
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            {buildStatusLabels[status]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Card */}
                <div className="mb-4">
                  {order.buildStatus === "awaiting_payment" &&
                    order.paymentStatus === "pending" && (
                      <Link
                        href={`/payment/${order.id}`}
                        className="block w-full bg-orange-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
                      >
                        Selesaikan Pembayaran
                      </Link>
                    )}

                  {order.buildStatus === "awaiting_payment" &&
                    order.paymentStatus === "claimed" && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                        <p className="text-sm text-yellow-800 font-medium">
                          Menunggu konfirmasi admin
                        </p>
                      </div>
                    )}

                  {(order.buildStatus === "payment_confirmed" ||
                    order.buildStatus === "designing") && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        Tim sedang membuat website Anda. Estimasi 2-3 hari.
                      </p>
                    </div>
                  )}

                  {order.buildStatus === "review" && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-sm text-purple-800">
                        Website hampir selesai! Tim akan menghubungi Anda
                        segera.
                      </p>
                    </div>
                  )}

                  {order.buildStatus === "done" && order.websiteUrl && (
                    <a
                      href={order.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Kunjungi Website
                    </a>
                  )}
                </div>

                {/* Order Meta */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    Order ID:{" "}
                    {order.id.substring(0, 4)}...{order.id.slice(-4)}
                  </p>
                  <p>
                    Dibuat:{" "}
                    {new Date(order.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  {order.nextBillingDate && (
                    <p>
                      Billing berikutnya:{" "}
                      {new Date(order.nextBillingDate).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
