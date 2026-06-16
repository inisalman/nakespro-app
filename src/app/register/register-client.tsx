"use client";

import { useState } from "react";
import Link from "next/link";

type Billing = "monthly" | "yearly";

const PLANS: Record<
  Billing,
  {
    label: string;
    price: number;
    period: string;
    perMonth: string;
    note: string;
    features: string[];
  }
> = {
  monthly: {
    label: "Paket Bulanan",
    price: 39000,
    period: "per bulan",
    perMonth: "Ditagih setiap bulan",
    note: "Fleksibel, bisa berhenti kapan saja",
    features: [
      "4 template profesional pilihan",
      "Domain gratis *.nakespro.id",
      "Live dalam 2-3 hari kerja",
      "Responsive di semua perangkat",
    ],
  },
  yearly: {
    label: "Paket Tahunan",
    price: 300000,
    period: "per tahun",
    perMonth: "Setara Rp25.000/bulan",
    note: "Hemat Rp168.000 dibanding bulanan",
    features: [
      "Semua fitur paket bulanan",
      "Hemat 36% dari paket bulanan",
      "Bayar sekali untuk 12 bulan",
      "Tanpa khawatir perpanjangan",
    ],
  },
};

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export default function RegisterClient({ userEmail }: { userEmail: string }) {
  const [billing, setBilling] = useState<Billing>("yearly");
  const plan = PLANS[billing];

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-[1fr_1.1fr]">
      {/* Left panel - branded summary (Stripe style) */}
      <aside className="relative flex flex-col bg-neutral-900 px-6 py-10 sm:px-10 lg:px-12 lg:py-16 text-white overflow-hidden">
        {/* Decorative gradient */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-accent-600/20 blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-md lg:mx-0">
          {/* Brand */}
          <Link href="/" className="inline-flex items-center gap-2 mb-12">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <span className="text-sm font-bold text-neutral-900">N</span>
            </div>
            <span className="text-base font-semibold tracking-tight">Nakespro</span>
          </Link>

          {/* Plan name + price */}
          <p className="text-sm text-neutral-400 mb-2">Berlangganan {plan.label}</p>
          <div className="flex items-end gap-2 mb-1">
            <span className="text-5xl font-bold tracking-tight">
              {formatRupiah(plan.price)}
            </span>
            <span className="mb-2 text-sm text-neutral-400">{plan.period}</span>
          </div>
          <p className="text-sm text-neutral-400 mb-10">{plan.perMonth}</p>

          {/* Line items */}
          <div className="space-y-4 border-t border-white/10 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">{plan.label}</p>
                <p className="text-xs text-neutral-400">Website profesional tenaga kesehatan</p>
              </div>
              <span className="text-sm font-medium text-white whitespace-nowrap">
                {formatRupiah(plan.price)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
              <span className="text-sm text-neutral-400">Subtotal</span>
              <span className="text-sm text-neutral-200">{formatRupiah(plan.price)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
              <span className="text-base font-semibold text-white">Total jatuh tempo</span>
              <span className="text-base font-semibold text-white">{formatRupiah(plan.price)}</span>
            </div>
          </div>

          {/* Features */}
          <ul className="mt-10 space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-neutral-300">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="mt-12 hidden lg:block">
            <p className="text-xs text-neutral-500">
              Pembayaran aman via QRIS. Butuh paket custom?{" "}
              <a
                href="https://wa.me/628123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 underline underline-offset-2 hover:text-white"
              >
                Hubungi kami
              </a>
            </p>
          </div>
        </div>
      </aside>

      {/* Right panel - plan selection + action */}
      <main className="flex flex-col bg-white px-6 py-10 sm:px-10 lg:px-16 lg:py-16">
        <div className="mx-auto w-full max-w-md">
          {/* Account */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Pilih paket berlangganan
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Masuk sebagai <span className="font-medium text-neutral-700">{userEmail}</span>
            </p>
          </div>

          {/* Billing toggle */}
          <div className="mb-6 inline-flex w-full rounded-xl bg-neutral-100 p-1">
            {(["monthly", "yearly"] as Billing[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setBilling(key)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  billing === key
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {key === "monthly" ? "Bulanan" : "Tahunan"}
                {key === "yearly" && (
                  <span className="ml-1.5 text-xs font-semibold text-green-600">-36%</span>
                )}
              </button>
            ))}
          </div>

          {/* Plan cards */}
          <div className="space-y-3">
            {(["yearly", "monthly"] as Billing[]).map((key) => {
              const p = PLANS[key];
              const active = billing === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setBilling(key)}
                  className={`w-full rounded-xl border-2 p-5 text-left transition-all ${
                    active
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          active ? "border-neutral-900" : "border-neutral-300"
                        }`}
                      >
                        {active && <span className="h-2.5 w-2.5 rounded-full bg-neutral-900" />}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{p.label}</p>
                        <p className="text-xs text-neutral-500">{p.note}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neutral-900">{formatRupiah(p.price)}</p>
                      <p className="text-xs text-neutral-500">{p.period}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <Link
            href={`/templates?billing=${billing}`}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg"
          >
            Lanjut pilih template
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          {/* Trust note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Pembayaran aman & terenkripsi via QRIS</span>
          </div>

          {/* Mobile WA */}
          <p className="mt-8 text-center text-xs text-neutral-500 lg:hidden">
            Butuh paket custom?{" "}
            <a
              href="https://wa.me/628123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary-600 hover:underline"
            >
              Hubungi kami
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
