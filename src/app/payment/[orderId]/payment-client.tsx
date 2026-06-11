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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up opacity-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-sm font-semibold text-primary-700 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Langkah 3 dari 4</span>
          </div>
          <h1 className="text-display mb-4">Selesaikan Pembayaran</h1>
          <p className="text-body-large text-neutral-600 max-w-2xl mx-auto">
            Scan QRIS dan upload bukti transfer untuk melanjutkan pembuatan website Anda
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Order Summary & Instructions */}
          <div className="space-y-6 animate-scale-in opacity-0 delay-100">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
              <h2 className="text-title mb-6">Ringkasan Pesanan</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-body pb-4 border-b border-neutral-100">
                  <span className="text-neutral-600">Template</span>
                  <span className="font-semibold text-neutral-900">{order.templateName}</span>
                </div>
                <div className="flex items-center justify-between text-body pb-4 border-b border-neutral-100">
                  <span className="text-neutral-600">Paket</span>
                  <span className="font-semibold text-neutral-900">
                    {order.billingCycle === "monthly" ? "Bulanan" : "Tahunan"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-body pb-4 border-b border-neutral-100">
                  <span className="text-neutral-600">Harga</span>
                  <span className="text-neutral-900">Rp{order.baseAmount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex items-center justify-between text-body pb-4 border-b border-neutral-100">
                  <span className="text-neutral-600">Kode unik</span>
                  <span className="text-primary-600 font-semibold">+Rp{order.uniqueCode}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-bold text-neutral-900">Total Pembayaran</span>
                  <span className="text-3xl font-bold text-primary-600">
                    Rp{order.totalAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-primary-900 mb-2">Cara Pembayaran</h3>
                  <ol className="list-decimal list-inside space-y-2 text-body-small text-primary-800">
                    <li>
                      Scan QRIS dan bayar <span className="font-bold">Rp{order.totalAmount.toLocaleString("id-ID")}</span> (dengan kode unik)
                    </li>
                    <li>Kode unik membantu kami mengidentifikasi pembayaran Anda</li>
                    <li>Upload bukti transfer untuk konfirmasi</li>
                    <li>Tim kami akan memverifikasi dalam 1-2 jam</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - QRIS & Upload */}
          <div className="space-y-6 animate-scale-in opacity-0 delay-200">
            {/* QRIS Display */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8">
              <h3 className="text-title text-center mb-6">Scan QRIS</h3>
              <div className="flex justify-center mb-4">
                <div className="w-full max-w-[300px] bg-neutral-50 rounded-2xl flex items-center justify-center border-2 border-neutral-200 overflow-hidden shadow-sm">
                  <img
                    src="/images/qris.jpeg"
                    alt="QRIS Nakespro"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
              <p className="text-center text-body-small text-neutral-600 font-medium mt-6">
                a.n NAKESPRO.ID, KOMPUTER & SOFTWARE
              </p>
              <p className="text-center text-body-small text-neutral-500 mt-1">
                Gunakan aplikasi mobile banking atau e-wallet Anda
              </p>
            </div>

            {/* Payment Status Alert */}
            {order.paymentStatus === "claimed" && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 animate-scale-in">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-1">Bukti Diterima</h4>
                    <p className="text-body-small text-orange-800">
                      Menunggu konfirmasi admin (1-2 jam kerja)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Proof Upload */}
            {order.paymentStatus === "pending" && (
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                <h3 className="text-title mb-6">Upload Bukti Transfer</h3>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-body-small text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label htmlFor="proof-upload" className="block text-body font-semibold text-neutral-900 mb-3">
                    Pilih file bukti transfer
                  </label>
                  <input
                    id="proof-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="block w-full text-body-small text-neutral-600
                      file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0
                      file:text-body-small file:font-semibold
                      file:bg-neutral-100 file:text-neutral-700
                      hover:file:bg-neutral-200 file:transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="mt-2 text-body-small text-neutral-500">
                    Format: JPG, PNG, atau WEBP (max 5MB)
                  </p>
                </div>

                {/* Preview */}
                {proofPreview && (
                  <div className="mb-6">
                    <p className="text-body font-semibold text-neutral-900 mb-3">Preview</p>
                    <img
                      src={proofPreview}
                      alt="Preview bukti transfer"
                      className="w-full rounded-xl border-2 border-neutral-200"
                    />
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!proofFile || loading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </span>
                  ) : (
                    "Konfirmasi Pembayaran"
                  )}
                </button>
              </div>
            )}

            {/* If claimed, show continue button */}
            {order.paymentStatus === "claimed" && (
              <button
                onClick={() => router.push(`/form/${order.id}`)}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Lanjut Isi Form Website
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
