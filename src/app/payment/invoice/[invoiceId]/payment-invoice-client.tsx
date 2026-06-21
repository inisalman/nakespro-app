"use client";

import { useState } from "react";
import { claimInvoicePayment } from "@/app/actions/invoice";
import { useRouter } from "next/navigation";
import {
  Upload,
  CheckCircle,
  Copy,
  ArrowLeft,
  Clock,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

interface PaymentInvoiceClientProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    baseAmount: number;
    uniqueCode: number;
    billingCycle: string;
    periodStart: string;
    periodEnd: string;
    status: string;
  };
  websiteName: string | null;
}

export default function PaymentInvoiceClient({
  invoice,
  websiteName,
}: PaymentInvoiceClientProps) {
  const router = useRouter();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cycleLabel =
    invoice.billingCycle === "monthly" ? "Bulanan" : "Tahunan";

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Format file harus JPG, PNG, atau WEBP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    setError(null);
    setProofFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!proofFile || !proofPreview) {
      setError("Silakan upload bukti pembayaran terlebih dahulu");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await claimInvoicePayment(invoice.id, proofPreview);
      if (!result.success) {
        setError(result.error || "Terjadi kesalahan");
        setLoading(false);
        return;
      }
      // Redirect ke dashboard langganan setelah sukses klaim
      router.push("/dashboard/langganan?paid=success");
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
      setError(err?.message || "Terjadi kesalahan");
      setLoading(false);
    }
  };

  const copyTotal = () => {
    navigator.clipboard.writeText(invoice.totalAmount.toString());
  };

  return (
    <div className="min-h-screen sm:bg-neutral-100 sm:flex sm:items-start sm:justify-center">
      <div className="w-full max-w-4xl sm:my-10 sm:rounded-2xl sm:overflow-hidden sm:shadow-xl bg-white">
        {/* Header */}
        <div className="px-5 sm:px-10 py-6 sm:py-8 border-b border-neutral-100">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/langganan"
              className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Perpanjangan Langganan
              </h1>
              <p className="text-sm text-neutral-500 mt-0.5">
                {invoice.invoiceNumber}
                {websiteName ? ` • ${websiteName}` : ""}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Pembayaran aman
            </div>
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-2 sm:divide-x sm:divide-neutral-100">
          {/* LEFT — Invoice Summary */}
          <div className="p-5 sm:p-10 bg-neutral-50/50">
            <h2 className="text-sm font-semibold text-neutral-900 mb-5">
              Ringkasan Tagihan
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">No. Tagihan</span>
                <span className="font-medium">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Siklus</span>
                <span className="font-medium">{cycleLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Periode</span>
                <span className="font-medium text-right max-w-[200px]">
                  {formatDate(invoice.periodStart)} —{" "}
                  {formatDate(invoice.periodEnd)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Harga langganan</span>
                <span>
                  Rp{invoice.baseAmount.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Kode unik</span>
                <span className="text-primary-600 font-medium">
                  +Rp{invoice.uniqueCode}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-neutral-100">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-sm font-bold text-neutral-900">
                    Total pembayaran
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {invoice.billingCycle === "monthly"
                      ? "Ditagih bulanan"
                      : "Ditagih per tahun"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-neutral-900">
                    Rp{invoice.totalAmount.toLocaleString("id-ID")}
                  </p>
                  <button
                    onClick={copyTotal}
                    className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1 ml-auto mt-1"
                  >
                    <Copy className="w-3 h-3" />
                    Salin
                  </button>
                </div>
              </div>
            </div>

            {invoice.status === "claimed" && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      Bukti Diterima
                    </p>
                    <p className="text-xs text-green-700 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      Menunggu verifikasi (1-2 jam)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — QRIS & Upload */}
          <div className="p-5 sm:p-10">
            {invoice.status === "pending" && (
              <div className="flex flex-col gap-5">
                {/* QRIS */}
                <div className="w-full">
                  <h2 className="text-sm font-semibold text-neutral-900 mb-3">
                    Bayar via QRIS
                  </h2>
                  <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm bg-white max-w-[280px] sm:max-w-none mx-auto sm:mx-0">
                    <img
                      src="/images/qris.jpeg"
                      alt="QRIS Nakespro"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-xs text-neutral-400 text-center mt-2">
                    Scan via mobile banking / e-wallet
                  </p>
                </div>

                {/* Upload */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                    Upload Bukti Transfer
                  </h3>

                  {error && (
                    <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                      {error}
                    </div>
                  )}

                  {!proofPreview ? (
                    <label
                      htmlFor="proof-upload"
                      className="flex items-center justify-center gap-2 w-full h-11 sm:h-32 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-neutral-900 hover:bg-neutral-50 transition-colors"
                    >
                      <Upload className="w-4 sm:w-6 h-4 sm:h-6 text-neutral-400" />
                      <span className="text-xs sm:text-sm font-medium text-neutral-600">
                        Pilih file bukti transfer
                      </span>
                      <span className="hidden sm:inline text-xs text-neutral-400">
                        JPG, PNG, WEBP (max 5MB)
                      </span>
                      <input
                        id="proof-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={loading}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="mb-3 sm:mb-4">
                      <img
                        src={proofPreview}
                        alt="Preview bukti transfer"
                        className="w-full rounded-xl border border-neutral-200"
                      />
                      <button
                        onClick={() => {
                          setProofFile(null);
                          setProofPreview(null);
                        }}
                        className="mt-2 text-xs text-neutral-500 hover:text-neutral-700 underline"
                      >
                        Ganti file
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={!proofFile || loading}
                    className="w-full sm:mt-1 mt-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Memproses..." : "Konfirmasi Pembayaran"}
                  </button>
                </div>
              </div>
            )}

            {invoice.status === "claimed" && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:min-h-[300px]">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-1">
                  Pembayaran Dikonfirmasi
                </h3>
                <p className="text-sm text-neutral-500 mb-6">
                  Bukti pembayaran Anda sedang diverifikasi oleh tim kami
                </p>
                <Link
                  href="/dashboard/langganan"
                  className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
                >
                  Kembali ke Langganan
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
