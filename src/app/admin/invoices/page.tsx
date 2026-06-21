import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import InvoiceActions from "./invoice-actions";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [];

const STATUS_CONFIG: Record<
  string,
  { label: string; style: string; order: number }
> = {
  claimed: {
    label: "Menunggu Verifikasi",
    style: "bg-orange-100 text-orange-800 ring-1 ring-orange-300",
    order: 0,
  },
  pending: {
    label: "Belum Dibayar",
    style: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300",
    order: 1,
  },
  paid: {
    label: "Lunas",
    style: "bg-green-100 text-green-800 ring-1 ring-green-300",
    order: 2,
  },
  overdue: {
    label: "Terlambat",
    style: "bg-red-100 text-red-800 ring-1 ring-red-300",
    order: 3,
  },
};

export default async function AdminInvoicesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  if (!ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/dashboard");
  }

  const invoices = await prisma.invoice.findMany({
    include: {
      order: { select: { websiteName: true, subdomain: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  // Sort: claimed first, then pending, then rest
  invoices.sort((a, b) => {
    const oa = STATUS_CONFIG[a.status]?.order ?? 99;
    const ob = STATUS_CONFIG[b.status]?.order ?? 99;
    return oa - ob;
  });

  return (
    <div className="w-full flex-1 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/admin"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-2 inline-block"
            >
              ← Kembali ke Admin Panel
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Tagihan Perpanjangan
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola pembayaran renewal langganan dari client
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-3 text-sm">
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-center">
              <p className="text-2xl font-bold text-orange-700">
                {invoices.filter((i) => i.status === "claimed").length}
              </p>
              <p className="text-orange-600 text-xs font-medium">
                Menunggu Verifikasi
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-center">
              <p className="text-2xl font-bold text-yellow-700">
                {invoices.filter((i) => i.status === "pending").length}
              </p>
              <p className="text-yellow-600 text-xs font-medium">
                Belum Dibayar
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center">
              <p className="text-2xl font-bold text-green-700">
                {invoices.filter((i) => i.status === "paid").length}
              </p>
              <p className="text-green-600 text-xs font-medium">Lunas</p>
            </div>
          </div>
        </div>

        {/* Invoice List */}
        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum ada tagihan perpanjangan
            </h3>
            <p className="text-gray-500">
              Tagihan akan muncul setelah client mengajukan perpanjangan
              langganan.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => {
              const cfg =
                STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.pending;

              return (
                <div
                  key={invoice.id}
                  className={`bg-white rounded-lg shadow-sm border-l-4 ${
                    invoice.status === "claimed"
                      ? "border-l-orange-500"
                      : invoice.status === "paid"
                        ? "border-l-green-500"
                        : "border-l-gray-300"
                  }`}
                >
                  <div className="p-6">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {invoice.invoiceNumber}
                          </h3>
                          <span
                            className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${cfg.style}`}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {invoice.order.websiteName || "Website tidak dikenal"}{" "}
                          {invoice.order.subdomain
                            ? `(${invoice.order.subdomain}.nakespro.id)`
                            : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          Rp{invoice.totalAmount.toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {invoice.billingCycle === "monthly"
                            ? "Bulanan"
                            : "Tahunan"}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500">Client</p>
                        <p className="font-medium text-gray-900">
                          {invoice.user.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {invoice.user.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Periode</p>
                        <p className="font-medium text-gray-900">
                          {new Date(
                            invoice.periodStart,
                          ).toLocaleDateString("id-ID")}
                          {" — "}
                          {new Date(
                            invoice.periodEnd,
                          ).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Base + Unik</p>
                        <p className="font-medium text-gray-900">
                          Rp{invoice.baseAmount.toLocaleString("id-ID")}
                          {" + Rp"}
                          {invoice.uniqueCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Dibuat</p>
                        <p className="font-medium text-gray-900">
                          {new Date(invoice.createdAt).toLocaleDateString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Payment Proof (hanya untuk claimed) */}
                    {invoice.status === "claimed" &&
                      invoice.paymentProofUrl && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-3">
                            Bukti Pembayaran
                          </p>
                          <div className="max-w-sm border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <img
                              src={invoice.paymentProofUrl}
                              alt={`Bukti pembayaran ${invoice.invoiceNumber}`}
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                      )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      <InvoiceActions invoice={invoice} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
