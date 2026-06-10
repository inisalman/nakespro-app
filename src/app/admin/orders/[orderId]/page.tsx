import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminOrderActions from "./admin-order-actions";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  if (!ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/dashboard");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Kembali ke Admin Panel
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Detail
          </h1>
          <p className="text-gray-600 font-mono text-sm">ID: {order.id}</p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Informasi Client
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nama</p>
              <p className="text-gray-900 font-medium">{order.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900 font-medium">{order.user.email}</p>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Informasi Order
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Template</p>
              <p className="text-gray-900 font-medium">{order.templateId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Billing Cycle</p>
              <p className="text-gray-900 font-medium">
                {order.billingCycle === "monthly" ? "Bulanan" : "Tahunan"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Base Amount</p>
              <p className="text-gray-900 font-medium">
                Rp{order.baseAmount.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Unique Code</p>
              <p className="text-gray-900 font-medium">{order.uniqueCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-gray-900 font-bold text-lg">
                Rp{order.totalAmount.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <p className="text-gray-900 font-medium">{order.paymentStatus}</p>
            </div>
          </div>
        </div>

        {/* Payment Proof */}
        {order.paymentProofUrl && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Bukti Pembayaran
            </h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden max-w-md">
              <img
                src={order.paymentProofUrl}
                alt="Bukti Pembayaran"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        {/* Website Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Detail Website
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Nama Website</p>
              <p className="text-gray-900 font-medium">
                {order.websiteName || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Deskripsi</p>
              <p className="text-gray-900">{order.description || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tipe Layanan</p>
              <p className="text-gray-900 font-medium">
                {order.serviceType || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nomor WhatsApp</p>
              <p className="text-gray-900 font-medium">
                {order.waNumber || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jam Praktik</p>
              <p className="text-gray-900">{order.practiceHours || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lokasi</p>
              <p className="text-gray-900">{order.location || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Google Maps</p>
              <p className="text-gray-900 break-all">
                {order.googleMaps || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Build Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Build Status
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Status</p>
              <p className="text-gray-900 font-medium">{order.buildStatus}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Website URL</p>
              <p className="text-gray-900 font-medium">
                {order.websiteUrl || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Is Active</p>
              <p className="text-gray-900 font-medium">
                {order.isActive ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Subdomain</p>
              <p className="text-gray-900 font-medium">
                {order.subdomain || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Timestamps</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="text-gray-900 font-medium">
                {new Date(order.createdAt).toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Paid At</p>
              <p className="text-gray-900 font-medium">
                {order.lastPaidAt
                  ? new Date(order.lastPaidAt).toLocaleString("id-ID")
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Next Billing Date</p>
              <p className="text-gray-900 font-medium">
                {order.nextBillingDate
                  ? new Date(order.nextBillingDate).toLocaleDateString("id-ID")
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Suspended At</p>
              <p className="text-gray-900 font-medium">
                {order.suspendedAt
                  ? new Date(order.suspendedAt).toLocaleString("id-ID")
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <AdminOrderActions order={order} />
      </div>
    </div>
  );
}
