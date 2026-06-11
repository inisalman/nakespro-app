"use client";

import { useSearchParams } from "next/navigation";
import { selectTemplate } from "@/app/actions/register";
import { useState } from "react";

const TEMPLATES = [
  {
    id: "modern-light",
    name: "Modern Light",
    character: "Bersih, terang, profesional",
    description: "Cocok untuk praktik mandiri, klinik kecil",
    color: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "modern-dark",
    name: "Modern Dark",
    character: "Elegan, gelap, premium",
    description: "Cocok untuk layanan premium, homecare eksklusif",
    color: "bg-slate-900",
    borderColor: "border-slate-700",
  },
  {
    id: "playful-geometry",
    name: "Playful Geometry",
    character: "Ceria, bentuk geometris, warna berani",
    description: "Cocok untuk layanan anak, fisioterapi, wellness",
    color: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    id: "calm-warm",
    name: "Calm & Warm",
    character: "Hangat, lembut, menenangkan",
    description: "Cocok untuk perawatan lansia, mental health, home nursing",
    color: "bg-amber-50",
    borderColor: "border-amber-200",
  },
];

export default function TemplatesPage() {
  const searchParams = useSearchParams();
  const billing = searchParams.get("billing") || "monthly";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectTemplate = async (templateId: string) => {
    setLoading(true);
    setError(null);

    try {
      await selectTemplate(templateId, billing as "monthly" | "yearly");
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat memilih template");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up opacity-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-sm font-semibold text-primary-700 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span>{billing === "monthly" ? "Paket Bulanan" : "Paket Tahunan"}</span>
          </div>
          <h1 className="text-display mb-4">
            Pilih Template Website Anda
          </h1>
          <p className="text-body-large text-neutral-600 max-w-2xl mx-auto">
            Pilih 1 dari 4 template profesional. Bisa diganti lewat WhatsApp sebelum proses build dimulai.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-body animate-scale-in">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {TEMPLATES.map((template, index) => (
            <div
              key={template.id}
              className={`bg-white rounded-2xl border-2 border-neutral-200 hover:border-primary-500 p-8 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer animate-scale-in opacity-0`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => !loading && handleSelectTemplate(template.id)}
            >
              {/* Template Preview */}
              <div className={`w-full h-56 ${template.color} rounded-xl mb-6 flex items-center justify-center border-2 ${template.borderColor} overflow-hidden relative group`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/30"></div>
                <div className="relative text-center z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 ${template.id === "modern-dark" ? "bg-white/20" : "bg-black/5"}`}>
                    <svg className={`w-8 h-8 ${template.id === "modern-dark" ? "text-white" : "text-neutral-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className={`text-sm font-semibold ${template.id === "modern-dark" ? "text-white" : "text-neutral-700"}`}>
                    {template.name}
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="mb-6">
                <h2 className="text-title mb-3">
                  {template.name}
                </h2>
                <p className="text-body-small font-semibold text-primary-600 mb-2">
                  {template.character}
                </p>
                <p className="text-body text-neutral-600">
                  {template.description}
                </p>
              </div>

              {/* Button */}
              <button
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!loading) handleSelectTemplate(template.id);
                }}
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
                  "Pilih Template"
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center animate-fade-in opacity-0 delay-400">
          <p className="text-body-small text-neutral-500 mb-2">
            💡 Belum yakin? Template bisa diganti sebelum build dimulai
          </p>
          <a
            href="https://wa.me/628123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-small text-primary-600 hover:text-primary-700 font-semibold hover:underline"
          >
            Konsultasi via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
