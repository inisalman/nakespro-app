"use client";

import { useState } from "react";
import { submitWebsiteForm } from "@/app/actions/form";
import { useRouter } from "next/navigation";

interface FormClientProps {
  orderId: string;
  defaultFullName?: string;
}

const SUBDOMAIN_SUFFIX = ".nakespro.id";

const slugifySubdomain = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);

export default function FormClient({ orderId, defaultFullName = "" }: FormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: defaultFullName,
    websiteName: "",
    subdomain: "",
    description: "",
    waNumber: "",
    practiceHours: "",
    location: "",
    googleMaps: "",
  });
  const [subdomainEdited, setSubdomainEdited] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "subdomain") {
      setSubdomainEdited(true);
      setFormData({ ...formData, subdomain: slugifySubdomain(value) });
      return;
    }

    if (name === "websiteName" && !subdomainEdited) {
      setFormData({
        ...formData,
        websiteName: value,
        subdomain: slugifySubdomain(value),
      });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const addServiceType = () => {
    const trimmed = serviceInput.trim();
    if (!trimmed) return;
    if (trimmed.length > 50) {
      setError("Tipe layanan maksimal 50 karakter");
      return;
    }
    if (serviceTypes.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setServiceInput("");
      return;
    }
    setServiceTypes([...serviceTypes, trimmed]);
    setServiceInput("");
    setError(null);
  };

  const removeServiceType = (index: number) => {
    setServiceTypes(serviceTypes.filter((_, i) => i !== index));
  };

  const handleServiceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addServiceType();
    }
  };

  const validate = () => {
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      return "Nama lengkap minimal 2 karakter";
    }
    if (!formData.websiteName || formData.websiteName.length < 3) {
      return "Nama website minimal 3 karakter";
    }
    if (!formData.subdomain || formData.subdomain.length < 3) {
      return "Subdomain minimal 3 karakter";
    }
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(formData.subdomain)) {
      return "Subdomain hanya boleh huruf kecil, angka, dan tanda hubung";
    }
    if (!formData.description || formData.description.trim().length < 1) {
      return "Deskripsi singkat wajib diisi";
    }
    if (serviceTypes.length === 0) {
      return "Tambahkan minimal 1 tipe layanan";
    }
    if (!formData.waNumber) {
      return "Nomor WhatsApp wajib diisi";
    }
    if (!/^628\d{9,12}$/.test(formData.waNumber)) {
      return "Format nomor WA harus 628xxx (9-12 digit)";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await submitWebsiteForm(orderId, {
        fullName: formData.fullName.trim(),
        websiteName: formData.websiteName,
        subdomain: formData.subdomain,
        description: formData.description,
        serviceTypes,
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

      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex-1 p-6 lg:p-10 max-w-4xl mx-auto animate-fade-in-up"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-full text-xs font-semibold text-primary-700 mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Langkah 4 dari 4</span>
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Informasi Website Anda</h1>
        <p className="text-body text-neutral-500">
          Lengkapi detail website untuk proses pembuatan
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Section: Informasi Pribadi */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-5">Informasi Pribadi</h2>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Contoh: dr. Andi Wijaya"
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
              maxLength={100}
            />
          </div>
        </div>

        {/* Section: Informasi Website */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-5">Informasi Website</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                Nama Website / Praktik <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="websiteName"
                value={formData.websiteName}
                onChange={handleChange}
                placeholder="Contoh: Klinik Sehat Bersama"
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                Subdomain Website <span className="text-red-500">*</span>
              </label>
              <div className="flex rounded-xl border border-neutral-200 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-colors overflow-hidden">
                <input
                  type="text"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleChange}
                  placeholder="klinik-sehat"
                  className="flex-1 min-w-0 px-3.5 py-2.5 text-sm focus:outline-none"
                  maxLength={30}
                  autoComplete="off"
                  spellCheck={false}
                />
                <span className="flex items-center px-3 bg-neutral-50 border-l border-neutral-200 text-sm text-neutral-600 font-medium">
                  {SUBDOMAIN_SUFFIX}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1.5">
                Huruf kecil, angka, dan tanda hubung. Akan otomatis dibuat dari nama website.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                Deskripsi Singkat <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ceritakan tentang praktik atau layanan Anda..."
                rows={3}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm resize-none"
                maxLength={500}
              />
              <p className="text-xs text-neutral-500 mt-1.5">
                {formData.description.length}/500 karakter
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                Tipe Layanan <span className="text-red-500">*</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyDown={handleServiceKeyDown}
                  placeholder="Contoh: Konsultasi Umum"
                  className="flex-1 min-w-0 px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={addServiceType}
                  disabled={!serviceInput.trim()}
                  className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tambah
                </button>
              </div>

              {serviceTypes.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {serviceTypes.map((service, i) => (
                    <li
                      key={`${service}-${i}`}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                    >
                      <span className="text-sm text-neutral-900 break-words">{service}</span>
                      <button
                        type="button"
                        onClick={() => removeServiceType(i)}
                        className="flex-shrink-0 w-7 h-7 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                        aria-label={`Hapus ${service}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-xs text-neutral-500 mt-1.5">
                Ketik tipe layanan lalu klik Tambah atau tekan Enter.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Kontak & Lokasi */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-5">Kontak & Lokasi</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="waNumber"
                value={formData.waNumber}
                onChange={handleChange}
                placeholder="628123456789"
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
              />
              <p className="text-xs text-neutral-500 mt-1.5">
                Format: 628xxx (tanpa tanda + atau 0)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                Jam Praktik
              </label>
              <input
                type="text"
                name="practiceHours"
                value={formData.practiceHours}
                onChange={handleChange}
                placeholder="Contoh: Senin-Sabtu, 08:00-17:00"
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                Lokasi / Alamat
              </label>
              <textarea
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Alamat lengkap praktik atau area layanan homecare"
                rows={2}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm resize-none"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                Google Maps Embed URL
              </label>
              <input
                type="text"
                name="googleMaps"
                value={formData.googleMaps}
                onChange={handleChange}
                placeholder="https://maps.google.com/..."
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
              />
              <p className="text-xs text-neutral-500 mt-1.5">
                Opsional - untuk menampilkan peta lokasi
              </p>
            </div>
          </div>
        </div>

        {/* Section: Photos */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-5">Upload Foto</h2>

          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-900 mb-0.5">
                  Fitur upload foto akan tersedia segera
                </p>
                <p className="text-xs text-primary-800">
                  Untuk saat ini, Anda bisa kirim foto via WhatsApp ke admin setelah submit form
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
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
    </form>
  );
}
