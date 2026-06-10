"use client";

import { useState } from "react";
import { claimPayment } from "@/app/actions/payment";
import { useRouter } from "next/navigation";

interface PaymentClientProps {
  order: {
    id: string;
    templateId: string;
    templateName: string;
    billingCycle: string;
    baseAmount: number;
    uniqueCode: number;
    totalAmount: number;
    paymentStatus: string;
  };
}

export default function PaymentClient({ order }: PaymentClientProps) {
  const router = useRouter();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Format file harus JPG, PNG, atau WEBP");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    setError(null);
    setProofFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofPreview(reader.result as string);
    };
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
      const result = await claimPayment(order.id, proofPreview);

      if (!result.success) {
        setError(result.error || "Terjadi kesalahan");
        setLoading(false);
        return;
      }

      // Success - redirect to form
      router.push(`/form/${order.id}`);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pembayaran</h1>
          <p className="text-gray-600">
            Selesaikan pembayaran untuk melanjutkan proses pembuatan website
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Ringkasan Pesanan
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Template:</span>
              <span className="font-medium">{order.templateName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Paket:</span>
              <span className="font-medium">
                Hemat {order.billingCycle === "monthly" ? "Bulanan" : "Tahunan"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Harga dasar:</span>
              <span>Rp{order.baseAmount.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kode unik:</span>
              <span className="text-green-600">+Rp{order.uniqueCode}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">
                Total Pembayaran:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                Rp{order.totalAmount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Instruksi Pembayaran
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>
              Scan QRIS di bawah ini dan bayar tepat{" "}
              <span className="font-bold">
                Rp{order.totalAmount.toLocaleString("id-ID")}
              </span>{" "}
              (termasuk kode unik)
            </li>
            <li>
              Kode unik membantu kami mengidentifikasi pembayaran Anda secara
              otomatis
            </li>
            <li>Setelah bayar, upload bukti transfer di bawah ini</li>
          </ol>
        </div>

        {/* QRIS Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">
            Scan QRIS
          </h3>
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-sm font-medium mb-2">QRIS Static</div>
                <div className="text-xs">[Placeholder untuk MVP]</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Alert */}
        {order.paymentStatus === "claimed" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              ✓ Bukti pembayaran sudah diterima. Menunggu konfirmasi admin.
            </p>
          </div>
        )}

        {/* Payment Proof Upload */}
        {order.paymentStatus === "pending" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Sudah bayar? Upload bukti transfer:
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="proof-upload"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Pilih file bukti transfer (JPG, PNG, atau WEBP, max 5MB)
              </label>
              <input
                id="proof-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </div>

            {/* Preview */}
            {proofPreview && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Preview:
                </p>
                <img
                  src={proofPreview}
                  alt="Preview bukti transfer"
                  className="max-w-sm rounded-lg border"
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!proofFile || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Konfirmasi Pembayaran"}
            </button>
          </div>
        )}

        {/* If claimed, show continue button */}
        {order.paymentStatus === "claimed" && (
          <button
            onClick={() => router.push(`/form/${order.id}`)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Lanjut Isi Form Website
          </button>
        )}
      </div>
    </div>
  );
}
