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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Detail Website
          </h1>
          <p className="text-gray-600">
            Isi informasi website Anda (Step {step} dari 3)
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {step} dari 3
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Website Details */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Informasi Website
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Website / Praktik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="websiteName"
                  value={formData.websiteName}
                  onChange={handleChange}
                  placeholder="Contoh: Klinik Sehat Bersama"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Singkat
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ceritakan tentang praktik atau layanan Anda..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500 karakter
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Layanan <span className="text-red-500">*</span>
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Lanjut
            </button>
          </div>
        )}

        {/* Step 2: Contact & Location */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Kontak & Lokasi
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="waNumber"
                  value={formData.waNumber}
                  onChange={handleChange}
                  placeholder="628123456789"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 628xxx (tanpa tanda + atau 0)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Praktik
                </label>
                <input
                  type="text"
                  name="practiceHours"
                  value={formData.practiceHours}
                  onChange={handleChange}
                  placeholder="Contoh: Senin-Sabtu, 08:00-17:00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi / Alamat
                </label>
                <textarea
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Alamat lengkap praktik atau area layanan homecare"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps Embed URL
                </label>
                <input
                  type="text"
                  name="googleMaps"
                  value={formData.googleMaps}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Opsional - untuk menampilkan peta lokasi
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Kembali
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Lanjut
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Photos (Simplified for MVP) */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Upload Foto (Opsional)
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                📸 Upload foto untuk MVP ini <strong>dilewati dulu</strong>.
                Anda bisa kirim foto via WhatsApp setelah submit form ini.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
              <p className="mb-2">Fitur upload foto akan tersedia segera</p>
              <p className="text-sm">
                Untuk saat ini, kirim foto via WhatsApp ke admin setelah submit
              </p>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Kembali
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Mengirim..." : "Submit & Selesai"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
