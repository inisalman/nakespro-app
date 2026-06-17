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
    ctaTarget:
      "https://wa.me/628568461024?text=Halo%20NakesPro.id,%20saya%20ingin%20tanya%20soal%20paket%20Professional",
    ctaLabel: "Diskusi via WhatsApp",
  },
};

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

function MobileSummary({
  plan,
  billing,
  selectedPlanId,
  displayPrice,
  displayPeriod,
  displayNote,
}: {
  plan: (typeof PLANS)[string];
  billing: Billing;
  selectedPlanId: string;
  displayPrice: number;
  displayPeriod: string;
  displayNote: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden mb-5 rounded-xl bg-neutral-900 text-white overflow-hidden">
      <div className="p-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mb-2">
          Ringkasan pesanan
        </p>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-semibold">{plan.label}</p>
            <p className="text-xs text-neutral-400">{plan.tagline}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">
              {selectedPlanId === "professional" && billing === "monthly"
                ? "-"
                : formatRupiah(displayPrice)}
            </p>
            {!(selectedPlanId === "professional" && billing === "monthly") && (
              <p className="text-xs text-neutral-400">{displayPeriod}</p>
            )}
          </div>
        </div>
        <p className="text-[10px] text-neutral-400">{displayNote}</p>
        {billing === "yearly" && selectedPlanId !== "professional" && (
          <p className="mt-1 text-[10px] font-medium text-green-400">
            Hemat dibanding bayar bulanan
          </p>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="mt-2.5 pt-2.5 w-full border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-400 hover:text-neutral-300 transition-colors"
        >
          <span>{plan.features.length} fitur termasuk domain & hosting</span>
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <svg
              className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-white/10">
          <ul className="pt-3 space-y-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary-400" strokeWidth={3} />
                <span className="text-[11px] leading-relaxed text-neutral-300">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function RegisterClient({ userEmail }: { userEmail: string }) {
  const [billing, setBilling] = useState<Billing>("yearly");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("advance");
  const plan = PLANS[selectedPlanId];

  const displayPrice =
    billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const displayPeriod = billing === "yearly" ? "/tahun" : "/bulan";
  const displayNote =
    billing === "yearly" ? plan.yearlyNote : plan.monthlyNote;

  return (
    <div className="w-full bg-neutral-100 flex items-start justify-center lg:min-h-screen">
      <div className="w-full max-w-5xl lg:grid lg:grid-cols-2 my-0 lg:my-10 lg:rounded-2xl lg:overflow-hidden lg:shadow-xl">
        {/* Left panel */}
        <aside className="hidden lg:flex relative flex-col bg-neutral-900 px-6 py-8 sm:px-10 lg:px-12 lg:py-14 text-white overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-600/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-accent-600/20 blur-3xl" />

          <div className="relative z-10 flex flex-col h-full">
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <span className="text-sm font-bold text-neutral-900">N</span>
              </div>
              <span className="text-base font-semibold tracking-tight">
                Nakespro
              </span>
            </Link>

            <div className="mb-6">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-3">
                Ringkasan pesanan
              </p>
              <h2 className="text-lg font-semibold text-white mb-1">
                {plan.label}
              </h2>
              <p className="text-sm text-neutral-400">{plan.tagline}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5 mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">
                  {selectedPlanId === "professional" && billing === "monthly"
                    ? "-"
                    : formatRupiah(displayPrice)}
                </span>
                {!(
                  selectedPlanId === "professional" && billing === "monthly"
                ) && (
                  <span className="text-sm text-neutral-400">
                    {displayPeriod}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-neutral-400">{displayNote}</p>
              {billing === "yearly" && selectedPlanId !== "professional" && (
                <p className="mt-1 text-xs font-medium text-green-400">
                  Hemat dibanding bayar bulanan
                </p>
              )}
            </div>

            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-3">
                Yang Anda dapatkan
              </p>
              <ul className="space-y-2.5">
                {plan.features.slice(0, 5).map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary-600/20">
                      <Check className="h-2.5 w-2.5 text-primary-400" strokeWidth={3} />
                    </span>
                    <span className="text-sm leading-relaxed text-neutral-300">
                      {feature}
                    </span>
                  </li>
                ))}
                {plan.features.length > 5 && (
                  <li className="pl-6.5 text-xs text-neutral-500">
                    +{plan.features.length - 5} fitur lainnya
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Lock className="h-3.5 w-3.5" />
                <span>Pembayaran aman via QRIS</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right panel */}
        <main className="flex flex-col bg-white px-5 py-6 sm:px-10 lg:px-12 lg:py-14">
          <div className="flex flex-col">
            {/* Mobile brand header */}
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900">
                <span className="text-xs font-bold text-white">N</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">Nakespro</span>
            </div>

            {/* Mobile compact summary */}
            <MobileSummary
              plan={plan}
              billing={billing}
              selectedPlanId={selectedPlanId}
              displayPrice={displayPrice}
              displayPeriod={displayPeriod}
              displayNote={displayNote}
            />

            <div className="mb-5 lg:mb-6">
              <h1 className="text-lg lg:text-xl font-bold tracking-tight text-neutral-900">
                Pilih paket berlangganan
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Masuk sebagai{" "}
                <span className="font-medium text-neutral-700">{userEmail}</span>
              </p>
            </div>

            {/* Billing toggle */}
            <div className="mb-5">
              <div className="inline-flex w-full rounded-lg bg-neutral-100 p-1">
                {(["monthly", "yearly"] as Billing[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setBilling(key);
                      if (
                        key === "monthly" &&
                        selectedPlanId === "professional"
                      ) {
                        setSelectedPlanId("advance");
                      }
                    }}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-all ${
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
            <div className="space-y-2 mb-5">
              {Object.entries(PLANS)
                .filter(
                  ([key]) =>
                    !(billing === "monthly" && key === "professional")
                )
                .map(([key, p]) => {
                  const active = selectedPlanId === key;
                  const price =
                    billing === "yearly" ? p.yearlyPrice : p.monthlyPrice;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedPlanId(key)}
                      className={`group relative w-full rounded-xl border-2 p-3.5 lg:p-4 text-left transition-all ${
                        active
                          ? "border-neutral-900 bg-neutral-50 shadow-sm"
                          : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                      }`}
                    >
                      {p.badge && (
                        <span className="absolute -top-2.5 left-4 rounded-full bg-neutral-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
                          {p.badge}
                        </span>
                      )}

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                              active
                                ? "border-neutral-900 bg-neutral-900"
                                : "border-neutral-300"
                            }`}
                          >
                            {active && (
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">
                              {p.label}
                            </p>
                            <p className="mt-0.5 text-xs text-neutral-500">
                              {p.tagline}
                            </p>
                          </div>
                        </div>
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
            <div>
              {selectedPlanId === "professional" ? (
                <a
                  href={plan.ctaTarget}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg active:translate-y-0"
                >
                  <MessageCircle className="h-4 w-4" />
                  {plan.ctaLabel}
                </a>
              ) : (
                <Link
                  href={`/templates?billing=${billing}&plan=${selectedPlanId}`}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg active:translate-y-0"
                >
                  Lanjut pilih template
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Aman & terenkripsi</span>
                </div>
                <span className="text-neutral-200">|</span>
                <span>QRIS & Transfer</span>
              </div>

              <p className="mt-3 text-center text-xs text-neutral-500">
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
          </div>
        </main>
      </div>
    </div>
  );
}
