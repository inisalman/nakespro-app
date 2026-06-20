"use client";

import { useState } from "react";
import { deleteReport, updateReportStatus } from "@/app/actions/reports";
import { useRouter } from "next/navigation";
import {
  Download,
  Send,
  Trash2,
  CheckCircle,
  Eye,
} from "lucide-react";

export interface Report {
  id: string;
  invoiceNumber: string;
  status: string;
  patientName: string;
  patientWaNumber: string;
}

export default function ReportListActions({ report }: { report: Report }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading("delete");
    const result = await deleteReport(report.id);
    setLoading(null);
    setConfirmDelete(false);
    if (result.success) {
      router.refresh();
    }
  };

  const handleStatusChange = async (status: string) => {
    setLoading(status);
    await updateReportStatus(report.id, status);
    setLoading(null);
    router.refresh();
  };

  const waText = `Halo ${report.patientName}, berikut invoice untuk tindakan yang telah dilakukan:\n\n📄 ${report.invoiceNumber}\n\nSilakan buka link berikut untuk melihat invoice:\n${baseUrl}/api/reports/${report.id}/pdf?download=1\n\nTerima kasih 🙏`;
  const waUrl = `https://wa.me/${report.patientWaNumber}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="flex items-center gap-1">
      {/* Download PDF */}
      <a
        href={`/api/reports/${report.id}/pdf?download=1`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        title="Download PDF"
      >
        <Download size={16} />
      </a>

      {/* Preview PDF */}
      <a
        href={`/api/reports/${report.id}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        title="Lihat PDF"
      >
        <Eye size={16} />
      </a>

      {/* Kirim via WhatsApp */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        title="Kirim via WhatsApp"
      >
        <Send size={16} />
      </a>

      {/* Mark as Sent */}
      {report.status === "draft" && (
        <button
          onClick={() => handleStatusChange("sent")}
          disabled={loading === "sent"}
          className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          title="Tandai Terkirim"
        >
          <Send size={16} />
        </button>
      )}

      {/* Mark as Paid */}
      {report.status === "sent" && (
        <button
          onClick={() => handleStatusChange("paid")}
          disabled={loading === "paid"}
          className="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
          title="Tandai Lunas"
        >
          <CheckCircle size={16} />
        </button>
      )}

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={loading === "delete"}
        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
          confirmDelete
            ? "text-red-600 bg-red-50 hover:bg-red-100"
            : "text-neutral-400 hover:text-red-500 hover:bg-red-50"
        }`}
        title={confirmDelete ? "Klik lagi untuk konfirmasi hapus" : "Hapus"}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
