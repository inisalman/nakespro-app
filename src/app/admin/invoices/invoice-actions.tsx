"use client";

import { useState } from "react";
import { confirmInvoicePayment } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  status: string;
  paymentProofUrl: string | null;
}

export default function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (
      !confirm(
        `Yakin ingin konfirmasi pembayaran ${invoice.invoiceNumber}?\n\nOrder ID: ${invoice.orderId}\n\nStatus order akan diperpanjang otomatis.`,
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    const result = await confirmInvoicePayment(invoice.id);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Terjadi kesalahan");
      return;
    }

    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      {invoice.status === "claimed" && (
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <CheckCircle size={16} />
          {loading ? "Memproses..." : "Konfirmasi Pembayaran"}
        </button>
      )}

      <Link
        href={`/admin/orders/${invoice.orderId}`}
        className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm font-medium transition"
      >
        <ExternalLink size={14} />
        Lihat Order
      </Link>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
