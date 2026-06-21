import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import LanggananActions, { type InvoiceRow, type OrderInfo } from "./langganan-actions";
import { CreditCard, Calendar, RefreshCw, Receipt, FileText } from "lucide-react";

export default async function LanggananPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  // Ambil order utama user (terbaru).
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  // User pertama kali tanpa order -> arahkan ke register.
  if (orders.length === 0) {
    redirect("/register");
  }

  const order = orders[0];

  // Riwayat tagihan langganan (per siklus).
  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    orderBy: { issuedAt: "desc" },
  });

  const isWebsiteLive = order.buildStatus === "done";
  const planLabel = order.packageType === "hemat" ? "Starter" : "Profesional";
  const cycleLabel = order.billingCycle === "monthly" ? "Bulanan" : "Tahunan";

  const nextBilling = order.nextBillingDate
    ? new Date(order.nextBillingDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const lastPaid = order.lastPaidAt
    ? new Date(order.lastPaidAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  // Apakah ada tagihan yang masih menunggu pembayaran?
  const hasOutstanding = invoices.some(
    (inv) => inv.status === "pending" || inv.status === "claimed"
  );

  const orderInfo: OrderInfo = {
    id: order.id,
    isActive: order.isActive,
    buildStatus: order.buildStatus,
    billingCycle: order.billingCycle,
    hasOutstanding,
  };

  return (
    <div className="w-full flex-1 p-6 lg:p-10 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-display text-2xl lg:text-3xl font-bold text-neutral-900 mb-1">
            Langganan &amp; Tagihan
          </h1>
          <p className="text-body text-neutral-500">
            Kelola langganan website dan riwayat tagihan Anda
          </p>
        </div>
        <LanggananActions order={orderInfo} />
      </div>

      {/* Kartu Status Langganan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Paket & Siklus */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <CreditCard className="text-primary-600" size={20} />
            </div>
            {order.isActive ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Aktif
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                Belum Aktif
              </span>
            )}
          </div>
          <div className="mt-auto">
            <p className="text-sm font-medium text-neutral-500 mb-1">Paket {planLabel}</p>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">{cycleLabel}</h3>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-100">
              <span className="text-sm text-neutral-500">Nominal tagihan</span>
              <span className="text-sm font-semibold text-neutral-900">
                Rp{order.baseAmount.toLocaleString("id-ID")}
                <span className="text-neutral-400 font-normal">
                  {" "}/{order.billingCycle === "monthly" ? "bln" : "thn"}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Tagihan Berikutnya */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Calendar className="text-indigo-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="text-sm font-medium text-neutral-500 mb-1">Tagihan Berikutnya</p>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              {nextBilling ?? "—"}
            </h3>
            <div className="flex items-center p-3 bg-neutral-50 rounded-lg border border-neutral-100">
              {nextBilling ? (
                <span className="text-sm text-neutral-600">
                  {order.isActive
                    ? "Pastikan pembayaran sebelum jatuh tempo"
                    : "Tagihan mulai setelah website live"}
                </span>
              ) : (
                <span className="text-sm text-neutral-500">
                  Belum ada jadwal tagihan
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pembayaran Terakhir */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
              <Receipt className="text-teal-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="text-sm font-medium text-neutral-500 mb-1">Pembayaran Terakhir</p>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              {lastPaid ?? "—"}
            </h3>
            <div className="flex items-center p-3 bg-neutral-50 rounded-lg border border-neutral-100">
              <span className="text-sm text-neutral-600">
                {lastPaid
                  ? "Terima kasih, langganan aktif"
                  : "Belum ada pembayaran tercatat"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Tagihan */}
      <div className="mb-3">
        <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <FileText size={20} className="text-neutral-400" />
          Riwayat Tagihan
        </h2>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
            <Receipt className="text-primary-600" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Belum ada tagihan
          </h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
            {isWebsiteLive
              ? "Tagihan perpanjangan akan muncul di sini setelah Anda mengajukan perpanjangan langganan."
              : "Tagihan langganan akan tersedia setelah website Anda live."}
          </p>
          {isWebsiteLive && !hasOutstanding && (
            <LanggananActions order={orderInfo} variant="cta" />
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    No. Tagihan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Periode
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-primary-700 whitespace-nowrap">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 whitespace-nowrap">
                      {new Date(inv.periodStart).toLocaleDateString("id-ID")}
                      {" — "}
                      {new Date(inv.periodEnd).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900 font-semibold text-right whitespace-nowrap">
                      Rp{inv.totalAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <InvoiceRowActions
                        invoice={inv as unknown as InvoiceRow}
                        orderId={order.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-neutral-100">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-primary-700">
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {new Date(inv.periodStart).toLocaleDateString("id-ID")}
                      {" — "}
                      {new Date(inv.periodEnd).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <InvoiceStatusBadge status={inv.status} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold text-neutral-900">
                    Rp{inv.totalAmount.toLocaleString("id-ID")}
                  </p>
                  <InvoiceRowActions
                    invoice={inv as unknown as InvoiceRow}
                    orderId={order.id}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catatan pembayaran manual */}
      <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <RefreshCw className="text-blue-600 shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-0.5">Pembayaran manual via QRIS</p>
          <p className="text-blue-700">
            Setelah klik &quot;Bayar&quot;, scan QRIS dan upload bukti transfer.
            Admin akan verifikasi dalam 1–2 jam kerja.
          </p>
        </div>
      </div>
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: {
      label: "Menunggu Bayar",
      className: "bg-yellow-100 text-yellow-700",
    },
    claimed: {
      label: "Diverifikasi",
      className: "bg-blue-100 text-blue-700",
    },
    paid: {
      label: "Lunas",
      className: "bg-green-100 text-green-700",
    },
    overdue: {
      label: "Terlambat",
      className: "bg-red-100 text-red-700",
    },
  };

  const { label, className } = config[status] ?? config.pending;

  return (
    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${className}`}>
      {label}
    </span>
  );
}

/** Aksi per-baris: tombol bayar (link ke halaman QRIS invoice perpanjangan) untuk tagihan pending. */
function InvoiceRowActions({
  invoice,
  orderId: _orderId,
}: {
  invoice: InvoiceRow;
  orderId: string;
}) {
  if (invoice.status === "pending") {
    return (
      <Link
        href={`/payment/invoice/${invoice.id}`}
        className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
      >
        Bayar
      </Link>
    );
  }
  return <span className="text-xs text-neutral-400">—</span>;
}
