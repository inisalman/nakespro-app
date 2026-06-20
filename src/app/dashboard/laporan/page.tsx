import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReportListActions from "./report-list-actions";
import type { Report } from "./report-list-actions";
import { Plus, FileText, ArrowRight } from "lucide-react";

export default async function LaporanPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  const reports = await prisma.report.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="w-full flex-1 p-6 lg:p-10 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-display text-2xl lg:text-3xl font-bold text-neutral-900 mb-1">
            Laporan Tindakan & Invoice
          </h1>
          <p className="text-body text-neutral-500">
            Kelola laporan tindakan pasien dan buat invoice PDF
          </p>
        </div>
        <Link
          href="/dashboard/laporan/baru"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={18} />
          Buat Laporan Baru
        </Link>
      </div>

      {/* Empty State */}
      {reports.length === 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
            <FileText className="text-primary-600" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Belum ada laporan
          </h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
            Buat laporan tindakan pertama Anda untuk mulai membuat invoice
            yang bisa dikirim ke pasien via WhatsApp.
          </p>
          <Link
            href="/dashboard/laporan/baru"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Buat Laporan Pertama
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Report List */}
      {reports.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    No. Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Pasien
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Tindakan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Tanggal
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
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-primary-700 whitespace-nowrap">
                      {report.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900 font-medium">
                      {report.patientName}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {report.actionType}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500 whitespace-nowrap">
                      {new Date(report.actionDate).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900 font-semibold text-right whitespace-nowrap">
                      Rp{report.totalAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ReportListActions
                        report={report as unknown as Report}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-neutral-100">
            {reports.map((report) => (
              <div key={report.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-primary-700">
                      {report.invoiceNumber}
                    </p>
                    <p className="text-base font-semibold text-neutral-900">
                      {report.patientName}
                    </p>
                  </div>
                  <StatusBadge status={report.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                  <span>{report.actionType}</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span>
                    {new Date(report.actionDate).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold text-neutral-900">
                    Rp{report.totalAmount.toLocaleString("id-ID")}
                  </p>
                  <ReportListActions
                    report={report as unknown as Report}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    draft: {
      label: "Draft",
      className: "bg-neutral-100 text-neutral-600",
    },
    sent: {
      label: "Terkirim",
      className: "bg-blue-100 text-blue-700",
    },
    paid: {
      label: "Lunas",
      className: "bg-green-100 text-green-700",
    },
  };

  const { label, className } = config[status] ?? config.draft;

  return (
    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${className}`}>
      {label}
    </span>
  );
}
