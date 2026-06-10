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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pilih Template Website Kamu
          </h1>
          <p className="text-lg text-gray-600">
            Pilih 1 dari 4 template. Bisa diganti lewat WhatsApp sebelum build
            dimulai.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {TEMPLATES.map((template) => (
            <div
              key={template.id}
              className={`${template.color} rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer p-6 border-2 ${template.borderColor}`}
              onClick={() => handleSelectTemplate(template.id)}
            >
              {/* Template Preview */}
              <div className="w-full h-48 rounded-lg mb-6 flex items-center justify-center text-gray-400 bg-white/50 border border-gray-200">
                <div className="text-center">
                  <div className="text-sm font-medium mb-2">Preview</div>
                  <div className="text-xs">{template.name}</div>
                </div>
              </div>

              {/* Template Info */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {template.name}
              </h2>

              <p className="text-sm font-semibold text-gray-700 mb-3">
                {template.character}
              </p>

              <p className="text-sm text-gray-600 mb-6">{template.description}</p>

              {/* Button */}
              <button
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Memproses..." : "Pilih Template"}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center text-gray-600">
          <p>Billing: <span className="font-semibold">{billing === "monthly" ? "Bulanan" : "Tahunan"}</span></p>
        </div>
      </div>
    </div>
  );
}
