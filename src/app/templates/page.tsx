"use client";

import { useSearchParams } from "next/navigation";
import { selectTemplate } from "@/app/actions/register";
import { useState, useRef, useEffect } from "react";

const TEMPLATES = [
  {
    id: "modern-light",
    name: "Modern Light",
    character: "Bersih, terang, profesional",
    description: "Cocok untuk praktik mandiri, klinik kecil",
    url: "https://modernlight.nakespro.id/",
    accentBorder: "border-blue-500",
    accentBg: "bg-blue-500",
    accentRing: "ring-blue-500/20",
    accentText: "text-blue-600",
  },
  {
    id: "clean-medical",
    name: "Clean Medical",
    character: "Klinis, rapi, tepercaya",
    description: "Cocok untuk fisioterapi, rehabilitasi, klinik medis",
    url: "https://cleanmedical.nakespro.id/",
    accentBorder: "border-cyan-500",
    accentBg: "bg-cyan-500",
    accentRing: "ring-cyan-500/20",
    accentText: "text-cyan-600",
  },
  {
    id: "friendly-care",
    name: "Friendly Care",
    character: "Ceria, hangat, ramah keluarga",
    description: "Cocok untuk bidan, perawatan ibu & anak, laktasi",
    url: "https://friendlycare.nakespro.id/",
    accentBorder: "border-purple-500",
    accentBg: "bg-purple-500",
    accentRing: "ring-purple-500/20",
    accentText: "text-purple-600",
  },
  {
    id: "calm-warm",
    name: "Calm & Warm",
    character: "Hangat, lembut, menenangkan",
    description: "Cocok untuk perawatan lansia, mental health, home nursing",
    url: "https://calmwarm.nakespro.id/",
    accentBorder: "border-amber-500",
    accentBg: "bg-amber-500",
    accentRing: "ring-amber-500/20",
    accentText: "text-amber-600",
  },
];

function Preview({ url, name }: { url: string; name: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="w-full max-w-sm sm:max-w-5xl mx-auto rounded-2xl overflow-hidden border border-neutral-300 bg-neutral-900 shadow-2xl flex flex-col">
      <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-neutral-800 flex-shrink-0">
        <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-red-400 flex-shrink-0" />
        <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-yellow-400 flex-shrink-0" />
        <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-green-400 flex-shrink-0" />
        <div className="ml-2 sm:ml-3 flex-1 flex items-center bg-neutral-700 rounded sm:rounded-md px-2 sm:px-3 py-0.5 sm:py-1">
          <span className="text-[10px] sm:text-xs text-neutral-400 truncate">{url}</span>
        </div>
      </div>

      <div className="relative aspect-[9/16] sm:aspect-[16/10]">
        {!loaded && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-800 gap-2 sm:gap-3">
            <svg className="animate-spin w-6 sm:w-8 h-6 sm:h-8 text-neutral-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs sm:text-sm text-neutral-400">Memuat {name}...</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-800 gap-2">
            <p className="text-xs sm:text-sm text-neutral-400">Pratinjau tidak tersedia</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-blue-400 hover:text-blue-300">
              Buka di tab baru &rarr;
            </a>
          </div>
        )}

        <iframe
          key={url}
          src={url}
          title={`Pratinjau ${name}`}
          className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </div>
    </div>
  );
}

function ThumbnailCard({
  template,
  isActive,
  onClick,
  mobile,
}: {
  template: (typeof TEMPLATES)[number];
  isActive: boolean;
  onClick: () => void;
  mobile?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-xl border-2 text-left transition-all duration-200 bg-white flex-shrink-0 ${
        mobile ? "w-[58vw] p-2.5" : "p-4"
      } ${
        isActive
          ? `${template.accentBorder} ring-2 ${template.accentRing} shadow-md`
          : "border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
      }`}
    >
      <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${isActive ? template.accentBg : "bg-neutral-200"}`} />

      <div className={`w-full rounded-lg mb-1.5 overflow-hidden border bg-neutral-100 ${isActive ? template.accentBorder : "border-neutral-200"}`}>
        <div className="relative" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={template.url}
            title={template.name}
            className="absolute inset-0 w-full h-full pointer-events-none"
            sandbox="allow-scripts allow-same-origin"
            style={{ transform: "scale(0.35)", transformOrigin: "top left", width: "285%", height: "285%" }}
          />
        </div>
      </div>

      <h3 className="text-[11px] font-bold text-neutral-900 leading-tight">
        {template.name}
      </h3>
      <p className={`text-[10px] mt-0.5 leading-snug ${isActive ? template.accentText : "text-neutral-500"}`}>
        {template.character}
      </p>
    </button>
  );
}

export default function TemplatesPage() {
  const searchParams = useSearchParams();
  const billing = searchParams.get("billing") || "monthly";
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = TEMPLATES[activeIndex];

  const selectIndex = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.children[activeIndex] as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [activeIndex]);

  const handleSelectTemplate = async (templateId: string) => {
    setLoading(true);
    setError(null);
    try {
      await selectTemplate(templateId, billing as "monthly" | "yearly");
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
      setError(err?.message || "Terjadi kesalahan saat memilih template");
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-12">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-sm font-semibold text-primary-700 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span>{billing === "monthly" ? "Paket Bulanan" : "Paket Tahunan"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 mb-3 sm:mb-4">
            Pilih Template Website Anda
          </h1>
          <p className="text-sm sm:text-lg text-neutral-600 max-w-2xl mx-auto">
            Klik template di bawah untuk melihat pratinjau langsung. Template bisa diganti lewat WhatsApp sebelum build dimulai.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-3xl mx-auto mb-3 sm:mb-8 p-2 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex-shrink-0">
            <div className="flex items-start gap-2 sm:gap-3">
              <svg className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Template Selector — Mobile: horizontal scroll, Desktop: grid */}
        <div className="max-w-4xl mx-auto w-full mb-3 sm:mb-8">
          {/* Mobile: horizontal scroll */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide sm:hidden"
          >
            {TEMPLATES.map((template, index) => (
              <div key={template.id} className="snap-center">
                <ThumbnailCard
                  template={template}
                  isActive={index === activeIndex}
                  onClick={() => selectIndex(index)}
                  mobile
                />
              </div>
            ))}
          </div>

          {/* Desktop: 4-column grid */}
          <div className="hidden sm:grid grid-cols-4 gap-4">
            {TEMPLATES.map((template, index) => (
              <ThumbnailCard
                key={template.id}
                template={template}
                isActive={index === activeIndex}
                onClick={() => selectIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Main Preview */}
        <div className="max-w-5xl mx-auto w-full mb-3 sm:mb-10">
          <Preview url={active.url} name={active.name} />
        </div>

        {/* CTA + Info */}
        <div className="max-w-2xl mx-auto w-full text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <h2 className="text-sm sm:text-2xl font-bold text-neutral-900">
              {active.name}
            </h2>
            <span className={`hidden sm:inline w-1.5 h-1.5 rounded-full ${active.accentBg}`} />
            <span className={`text-[11px] sm:text-base ${active.accentText}`}>
              {active.character}
            </span>
          </div>
          <p className="text-[10px] sm:text-sm text-neutral-500 mt-0.5 sm:mt-1.5 mb-2.5 sm:mb-6">
            {active.description}
          </p>

          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <button
              disabled={loading}
              className="btn-primary px-6 sm:px-10 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleSelectTemplate(active.id)}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <svg className="animate-spin w-4 sm:w-5 h-4 sm:h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                `Pilih ${active.name}`
              )}
            </button>
            <a
              href={active.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] sm:text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <svg className="w-3 sm:w-4 h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Demo
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-3 sm:mt-8 sm:pt-6 border-t border-neutral-200">
          <p className="text-[10px] sm:text-sm text-neutral-400 sm:text-neutral-500">
            Belum yakin? <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline">Konsultasi via WhatsApp</a>
          </p>
        </div>
      </div>
    </div>
  );
}
