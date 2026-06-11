import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  // If logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full flex-1 min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 gradient-hero opacity-10"></div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center animate-fade-in-up opacity-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-50 rounded-full text-xs sm:text-sm font-semibold text-primary-700 mb-4 sm:mb-6">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="break-words">Website Builder #1 untuk Tenaga Kesehatan</span>
            </div>

            <h1 className="text-display mb-4 sm:mb-6 max-w-4xl mx-auto px-4">
              Website Profesional untuk
              <br />
              <span className="text-primary-600">Tenaga Kesehatan</span>
            </h1>

            <p className="text-body-large text-neutral-600 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
              Paket Hemat mulai Rp25.000/bulan. Website siap pakai dalam 2-3 hari kerja.
              Cocok untuk praktik mandiri, klinik, dan layanan homecare.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-scale-in opacity-0 delay-100 px-4">
              <Link
                href="/auth/login"
                className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <span>Mulai Sekarang</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="https://nakespro.id"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <span>Lihat Demo</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 sm:p-8 hover:border-primary-500 transition-all hover:-translate-y-1 animate-scale-in opacity-0 delay-200">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-title mb-2 sm:mb-3">Cepat & Mudah</h3>
            <p className="text-body text-neutral-600">
              Website siap dalam 2-3 hari kerja. Tinggal isi detail praktik, kami yang build.
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 sm:p-8 hover:border-primary-500 transition-all hover:-translate-y-1 animate-scale-in opacity-0 delay-300">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-title mb-2 sm:mb-3">Harga Terjangkau</h3>
            <p className="text-body text-neutral-600">
              Mulai Rp25.000/bulan atau Rp300.000/tahun. Hemat 36% dengan paket tahunan.
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 sm:p-8 hover:border-primary-500 transition-all hover:-translate-y-1 animate-scale-in opacity-0 delay-400">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-accent-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-title mb-2 sm:mb-3">Template Profesional</h3>
            <p className="text-body text-neutral-600">
              Pilih dari 4 template khusus nakes & homecare. Responsive & modern.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-24">
        <div className="bg-white rounded-3xl border-2 border-neutral-200 p-8 sm:p-12 text-center animate-scale-in opacity-0 delay-500">
          <h2 className="text-headline mb-3 sm:mb-4">Siap Memulai?</h2>
          <p className="text-body-large text-neutral-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Login dengan Google untuk mulai membuat website profesional Anda dalam hitungan menit
          </p>
          <Link
            href="/auth/login"
            className="btn-primary text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 inline-flex items-center gap-2"
          >
            <span>Login & Pesan Sekarang</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
