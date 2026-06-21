"use client";

import { useState } from "react";
import { createRenewalInvoice } from "@/app/actions/langganan";
import { useRouter } from "next/navigation";
import { RefreshCw, ArrowRight } from "lucide-react";

/** Data order ringan yang diperlukan client island untuk menentukan visibilitas tombol. */
export interface OrderInfo {
  id: string;
  isActive: boolean;
  buildStatus: string;
  billingCycle: string;
  hasOutstanding: boolean;
}

/** Tipe Invoice yang dipakai server component (untuk tabel). */
export interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  status: string;
}

interface LanggananActionsProps {
  order: OrderInfo;
  /** "cta" = full-width CTA variant (dipakai di empty state). Default = compact header button. */
  variant?: "cta";
}

export default function LanggananActions({ order, variant }: LanggananActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRenew =
    order.isActive &&
    order.buildStatus === "done" &&
    !order.hasOutstanding;

  const handleRenew = async () => {
    setLoading(true);
    setError(null);
    const result = await createRenewalInvoice(order.id);
    setLoading(false);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error ?? "Gagal membuat tagihan");
    }
  };

  if (!canRenew) return null;

  // CTA variant (untuk empty state).
  if (variant === "cta") {
    return (
      <button
        onClick={handleRenew}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
      >
        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        {loading ? "Memproses..." : "Perpanjang Langganan"}
        <ArrowRight size={16} />
      </button>
    );
  }

  // Default compact header button.
  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleRenew}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
      >
        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        {loading ? "Memproses..." : "Perpanjang Langganan"}
      </button>
      {error && (
        <p className="text-xs text-red-600 max-w-[200px] text-right">{error}</p>
      )}
    </div>
  );
}
