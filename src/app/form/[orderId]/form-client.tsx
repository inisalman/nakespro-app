"use client";

import { useState } from "react";
import { submitWebsiteForm } from "@/app/actions/form";
import { useRouter } from "next/navigation";

interface FormClientProps {
  orderId: string;
}

export default function FormClient({ orderId }: FormClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    websiteName: "",
    description: "",
    serviceType: "" as "nakes" | "homecare" | "both" | "",
    waNumber: "",
    practiceHours: "",
    location: "",
    googleMaps: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!formData.websiteName || formData.websiteName.length < 3) {
      setError("Nama website minimal 3 karakter");
      return false;
    }
    if (!formData.serviceType) {
      setError("Pilih tipe layanan");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.waNumber) {
      setError("Nomor WhatsApp wajib diisi");
      return false;
    }
    if (!/^628\d{9,12}$/.test(formData.waNumber)) {
      setError("Format nomor WA harus 628xxx (9-12 digit)");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);

    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;

    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await submitWebsiteForm(orderId, {
        websiteName: formData.websiteName,
        description: formData.description || undefined,
        serviceType: formData.serviceType as "nakes" | "homecare" | "both",
        waNumber: formData.waNumber,
        practiceHours: formData.practiceHours || undefined,
        location: formData.location || undefined,
        googleMaps: formData.googleMaps || undefined,
      });

      if (!result.success) {
        setError(result.error || "Terjadi kesalahan");
        setLoading(false);
        return;
      }

      // Success - redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up opacity-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-sm font-semibold text-primary-700 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Langkah 4 dari 4</span>
          </div>
          <h1 className="text-display mb-4">Informasi Website Anda</h1>
          <p className="text-body-large text-neutral-600">
            Lengkapi detail website untuk proses pembuatan
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-12 animate-scale-in opacity-0 delay-100">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all ${
                    stepNum < step
                      ? "bg-primary-600 text-white"
                      : stepNum === step
                      ? "bg-primary-600 text-white ring-4 ring-primary-100"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {stepNum < step ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded-full transition-all ${
                      stepNum < step ? "bg-primary-600" : "bg-neutral-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <span className="text-body-small text-neutral-600 font-medium">
              Step {step} dari 3
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-scale-in">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-body-small text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Step 1: Website Details */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 animate-scale-in opacity-0 delay-200">
            <h2 className="text-title mb-6">Informasi Website</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-body font-semibold text-neutral-900 mb-2">
                  Nama Website / Praktik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="websiteName"
                  value={formData.websiteName}
                  onChange={handleChange}
                  placeholder="Contoh: Klinik Sehat Bersama"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-body"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-body font-semibold text-neutral-900 mb-2">
                  Deskripsi Singkat
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ceritakan tentang praktik atau layanan Anda..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-body resize-none"
                  maxLength={500}
                />
                <p className="text-body-small text-neutral-500 mt-2">
                  {formData.description.length}/500 karakter
                </p>
              </div>

              <div>
                <label className="block text-body font-semibold text-neutral-900 mb-2">
                  Tipe Layanan <span className="text-red-500">*</span>
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-body bg-white"
                >
                  <option value="">Pilih tipe layanan</option>
                  <option value="nakes">Tenaga Kesehatan (Nakes)</option>
                  <option value="homecare">Homecare</option>
                  <option value="both">Keduanya</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full mt-8 btn-primary"
            >
              Lanjut ke Kontak
            </button>
          </div>
        )}

        {/* Step 2: Contact & Location */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 animate-scale-in opacity-0 delay-200">
            <h2 className="text-title mb-6">Kontak & Lokasi</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-body font-semibold text-neutral-900 mb-2">
                  Nomor WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="waNumber"
                  value={formData.waNumber}
                  onChange={handleChange}
                  placeholder="628123456789"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-body"
                />
                <p className="text-body-small text-neutral-500 mt-2">
                  Format: 628xxx (tanpa tanda + atau 0)
                </p>
              </div>

              <div>
                <label className="block text-body font-semibold text-neutral-900 mb-2">
                  Jam Praktik
                </label>
                <input
                  type="text"
                  name="practiceHours"
                  value={formData.practiceHours}
                  onChange={handleChange}
                  placeholder="Contoh: Senin-Sabtu, 08:00-17:00"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-body"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-body font-semibold text-neutral-900 mb-2">
                  Lokasi / Alamat
                </label>
                <textarea
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Alamat lengkap praktik atau area layanan homecare"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-body resize-none"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-body font-semibold text-neutral-900 mb-2">
                  Google Maps Embed URL
                </label>
                <input
                  type="text"
                  name="googleMaps"
                  value={formData.googleMaps}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-body"
                />
                <p className="text-body-small text-neutral-500 mt-2">
                  Opsional - untuk menampilkan peta lokasi
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex-1 btn-secondary"
              >
                Kembali
              </button>
              <button
                onClick={handleNext}
                className="flex-1 btn-primary"
              >
                Lanjut ke Review
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Photos (Simplified for MVP) */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 animate-scale-in opacity-0 delay-200">
            <h2 className="text-title mb-6">Upload Foto</h2>

            <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-body text-primary-900 mb-1">
                    📸 Fitur upload foto akan tersedia segera
                  </p>
                  <p className="text-body-small text-primary-800">
                    Untuk saat ini, Anda bisa kirim foto via WhatsApp ke admin setelah submit form
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-8 text-center border-2 border-dashed border-neutral-300">
              <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-body text-neutral-600 mb-2">
                Fitur upload foto akan segera hadir
              </p>
              <p className="text-body-small text-neutral-500">
                Kirim foto via WhatsApp setelah submit
              </p>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex-1 btn-secondary"
              >
                Kembali
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengirim...
                  </span>
                ) : (
                  "Submit & Selesai"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
