import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [];

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  if (!ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/dashboard");
  }

  const orders = await prisma.order.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const getPaymentStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      claimed: "bg-orange-100 text-orange-800",
      paid: "bg-green-100 text-green-800",
    };
    const labels: Record<string, string> = {
      pending: "Belum Bayar",
      claimed: "Diklaim",
      paid: "Lunas",
    };
    return { style: styles[status] || "bg-gray-100 text-gray-800", label: labels[status] || status };
  };

  const getBuildStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      awaiting_payment: "bg-gray-100 text-gray-800",
      payment_confirmed: "bg-blue-100 text-blue-800",
      designing: "bg-purple-100 text-purple-800",
      review: "bg-orange-100 text-orange-800",
      done: "bg-green-100 text-green-800",
    };
    const labels: Record<string, string> = {
      awaiting_payment: "Awaiting Payment",
      payment_confirmed: "Payment Confirmed",
      designing: "Designing",
      review: "Review",
      done: "Done",
    };
    return { style: styles[status] || "bg-gray-100 text-gray-800", label: labels[status] || status };
  };

  return (
    <div className="w-full flex-1 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Kelola semua order dan payment confirmation</p>
        </div>

        {/* Navigation Cards */}
        <div className="flex gap-4 mb-8">
          <Link
            href="/admin/invoices"
            className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tagihan Perpanjangan</h3>
                <p className="text-sm text-gray-500">Verifikasi pembayaran renewal langganan</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Build Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => {
                  const paymentBadge = getPaymentStatusBadge(order.paymentStatus);
                  const buildBadge = getBuildStatusBadge(order.buildStatus);

                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.websiteName || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.templateId}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${paymentBadge.style}`}
                        >
                          {paymentBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${buildBadge.style}`}
                        >
                          {buildBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Lihat Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {orders.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                Belum ada order
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
