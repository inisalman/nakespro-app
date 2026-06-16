"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Lock, ArrowRight, MessageCircle } from "lucide-react";

type Billing = "monthly" | "yearly";

const PLANS: Record<
  string,
  {
    label: string;
    tagline: string;
    monthlyPrice: number;
    yearlyPrice: number;
    monthlyNote: string;
    yearlyNote: string;
    features: string[];
    highlight?: boolean;
    badge?: string | null;
    ctaTarget?: string;
    ctaLabel?: string;
  }
> = {
  starter: {
    label: "Paket Starter",
    tagline: "Awali perjalanan digital praktik Anda",
    monthlyPrice: 49000,
    yearlyPrice: 300000,
    monthlyNote: "Ditagih bulanan",
    yearlyNote: "Ditagih Rp300.000/tahun",
    features: [
      "Gratis domain .nakespro.id",
      "Pantau performa lewat dashboard dan analitik pengunjung",
      "Website rampung dalam 1-3 hari, semua kami yang urus",
      "Sudah termasuk hosting dan server, tanpa biaya tambahan",
      "Tampil sempurna di layar HP, tablet, hingga laptop",
    ],
  },
  advance: {
    label: "Paket Advance",
    tagline: "Tampil maksimal dan dipercaya pasien",
    monthlyPrice: 150000,
    yearlyPrice: 999999,
    monthlyNote: "Ditagih bulanan",
    yearlyNote: "Ditagih Rp999.999/tahun",
    highlight: true,
    badge: "Rekomendasi",
    features: [
      "Tambahan domain gratis hingga .com untuk paket tahunan",
      "Optimasi SEO agar praktik Anda mudah ditemukan di Google",
      "Terhubung Google Maps & Google Bisnis untuk jangkauan lokal",
      "Booking online, pasien bisa pesan jadwal langsung dari website",
      "Buka seluruh fitur dashboard tanpa batasan",
      "Rekam dan tinjau riwayat tindakan pasien secara detail",
      "Invoice terkirim otomatis ke WhatsApp pasien",
      "Desain website dirancang sesuai identitas brand Anda",
      "Didampingi langsung oleh tim ahli kami dari awal",
    ],
  },
  professional: {
    label: "Paket Professional",
    tagline: "Fitur tanpa batas untuk praktik yang bertumbuh",
    monthlyPrice: 0,
    yearlyPrice: 3500000,
    monthlyNote: "Hanya tersedia tahunan",
    yearlyNote: "Ditagih Rp3.500.000/tahun",
    features: [
      "Semua yang ada di Advance, plus bonus domain .id eksklusif",
      "Revisi desain tidak dibatasi demi hasil yang sempurna",
      "Pengelolaan multi-website untuk banyak cabang praktik",
      "SEO tingkat lanjut & laporan performa bulanan",
      "Integrasi WhatsApp Business & chat otomatis ke pasien",
      "Halaman & layanan tanpa batas untuk kebutuhan apa pun",
      "Akses tim untuk kelola website bersama (multi-admin)",
      "Manajer akun khusus yang siap mendampingi Anda",
      "Prioritas utama untuk bantuan teknis & jaminan uptime",
    ],
    ctaTarget: "https://wa.me/628568461024?text=Halo%20NakesPro.id,%20saya%20ingin%20tanya%20soal%20paket%20Professional",
    ctaLabel: "Diskusi via WhatsApp",
  },
};

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export default function RegisterClient({ userEmail }: { userEmail: string }) {
  const [billing, setBilling] = useState<Billing>("yearly");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("advance");
  const plan = PLANS[selectedPlanId];

  const displayPrice = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const displayPeriod = billing === "yearly" ? "/tahun" : "/bulan";
  const displayNote = billing === "yearly" ? plan.yearlyNote : plan.monthlyNote;

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-[1fr_1.1fr]">
      {/* Left panel - branded summary */}
      <aside className="relative flex flex-col bg-neutral-900 px-6 py-10 sm:px-10 lg:px-12 lg:py-16 text-white overflow-hidden">
        {/* Decorative gradients */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-accent-600/20 blur-3xl" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col lg:mx-0">
          {/* Brand */}
          <Link href="/" className="inline-flex items-center gap-2 mb-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <span className="text-sm font-bold text-neutral-900">N</span>
            </div>
            <span className="text-base font-semibold tracking-tight">Nakespro</span>
          </Link>

          {/* Plan summary */}
          <div className="mb-8">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-3">
              Ringkasan pesanan
            </p>
            <h2 className="text-lg font-semibold text-white mb-1">{plan.label}</h2>
            <p className="text-sm text-neutral-400">{plan.tagline}</p>
          </div>

          {/* Price display */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-white">
                {selectedPlanId === "professional" && billing === "monthly"
                  ? "-"
                  : formatRupiah(displayPrice)}
              </span>
              {!(selectedPlanId === "professional" && billing === "monthly") && (
                <span className="text-sm text-neutral-400">{displayPeriod}</span>
              )}
            </div>
            <p className="mt-2 text-sm text-neutral-400">{displayNote}</p>
            {billing === "yearly" && selectedPlanId !== "professional" && (
              <p className="mt-1 text-xs font-medium text-green-400">
                Hemat dibanding bayar bulanan
              </p>
            )}
          </div>

          {/* Features */}
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-4">
              Yang Anda dapatkan
            </p>
            <ul className="space-y-3">
              {plan.features.slice(0, 5).map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-600/20">
                    <Check className="h-3 w-3 text-primary-400" strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-relaxed text-neutral-300">{feature}</span>
                </li>
              ))}
              {plan.features.length > 5 && (
                <li className="pl-8 text-xs text-neutral-500">
                  +{plan.features.length - 5} fitur lainnya
                </li>
              )}
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Lock className="h-3.5 w-3.5" />
              <span>Pembayaran aman via QRIS</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Right panel - plan selection */}
      <main className="flex flex-col bg-white px-6 py-10 sm:px-10 lg:px-16 lg:py-16">
        <div className="mx-auto w-full max-w-lg">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Pilih paket berlangganan
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Masuk sebagai{" "}
              <span className="font-medium text-neutral-700">{userEmail}</span>
            </p>
          </div>

          {/* Billing toggle */}
          <div className="mb-8">
            <div className="inline-flex w-full rounded-xl bg-neutral-100 p-1">
              {(["monthly", "yearly"] as Billing[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setBilling(key);
                    if (key === "monthly" && selectedPlanId === "professional") {
                      setSelectedPlanId("advance");
                    }
                  }}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                    billing === key
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {key === "monthly" ? "Bulanan" : "Tahunan"}
                  {key === "yearly" && (
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                      HEMAT
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Plan cards */}
          <div className="space-y-3 mb-8">
            {Object.entries(PLANS)
              .filter(([key]) => !(billing === "monthly" && key === "professional"))
              .map(([key, p]) => {
                const active = selectedPlanId === key;
                const price = billing === "yearly" ? p.yearlyPrice : p.monthlyPrice;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedPlanId(key)}
                    className={`group relative w-full rounded-xl border-2 p-5 text-left transition-all ${
                      active
                        ? "border-neutral-900 bg-neutral-50 shadow-sm"
                        : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                    }`}
                  >
                    {/* Badge */}
                    {p.badge && (
                      <span className="absolute -top-2.5 right-4 rounded-full bg-neutral-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
                        {p.badge}
                      </span>
                    )}

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {/* Radio */}
                        <span
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            active ? "border-neutral-900 bg-neutral-900" : "border-neutral-300"
                          }`}
                        >
                          {active && (
                            <span className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </span>
                        {/* Plan info */}
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">
                            {p.label}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-500">{p.tagline}</p>
                        </div>
                      </div>
                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-neutral-900">
                          {key === "professional" && billing === "monthly"
                            ? "-"
                            : formatRupiah(price)}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {key === "professional" && billing === "monthly"
                            ? "Hanya tahunan"
                            : billing === "yearly"
                              ? "/tahun"
                              : "/bulan"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>

          {/* CTA */}
          {selectedPlanId === "professional" ? (
            <a
              href={plan.ctaTarget}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-neutral-900 px-6 py-4 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg active:translate-y-0"
            >
              <MessageCircle className="h-4 w-4" />
              {plan.ctaLabel}
            </a>
          ) : (
            <Link
              href={`/templates?billing=${billing}&plan=${selectedPlanId}`}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-neutral-900 px-6 py-4 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg active:translate-y-0"
            >
              Lanjut pilih template
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}

          {/* Trust indicators */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              <span>Aman & terenkripsi</span>
            </div>
            <span className="text-neutral-200">•</span>
            <span>QRIS & Transfer</span>
          </div>

          {/* Help link */}
          <p className="mt-8 text-center text-xs text-neutral-500">
            Butuh bantuan memilih?{" "}
            <a
              href="https://wa.me/628568461024"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
            >
              Chat kami
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
