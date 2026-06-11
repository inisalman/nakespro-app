import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function RegisterPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in-up opacity-0">
          <h1 className="text-display mb-3 sm:mb-4">
            Pilih Paket Anda
          </h1>
          <p className="text-body-large text-neutral-600 px-4">
            Website profesional untuk tenaga kesehatan, mulai dari Rp25.000/bulan
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Monthly Plan */}
          <Link href="/templates?billing=monthly" className="group">
            <div className="bg-white rounded-2xl border-2 border-neutral-200 hover:border-primary-500 p-6 sm:p-8 transition-all hover:shadow-xl hover:-translate-y-1 animate-scale-in opacity-0 delay-100">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-title mb-2 sm:mb-3">
                  Paket Bulanan
                </h2>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl sm:text-5xl font-bold text-neutral-900">
                    Rp39.000
                  </span>
                  <span className="text-body text-neutral-500">/bulan</span>
                </div>
                <p className="text-body-small text-neutral-500">
                  Bayar setiap bulan, fleksibel
                </p>
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-body text-neutral-700">4 template profesional pilihan</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-body text-neutral-700">Domain gratis *.nakespro.id</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-body text-neutral-700">Live dalam 2-3 hari kerja</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-body text-neutral-700">Responsive di semua perangkat</span>
                </li>
              </ul>

              <button className="w-full btn-primary group-hover:bg-neutral-800">
                Pilih Paket Bulanan
              </button>
            </div>
          </Link>

          {/* Yearly Plan - Recommended */}
          <Link href="/templates?billing=yearly" className="group">
            <div className="bg-white rounded-2xl border-2 border-green-500 p-6 sm:p-8 transition-all hover:shadow-xl hover:-translate-y-1 relative animate-scale-in opacity-0 delay-200">
              {/* Recommended Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 bg-green-500 text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg whitespace-nowrap">
                  💰 Paling Hemat
                </span>
              </div>

              <div className="mb-4 sm:mb-6 mt-2">
                <h2 className="text-title mb-2 sm:mb-3">
                  Paket Tahunan
                </h2>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl sm:text-5xl font-bold text-green-600">
                    Rp300.000
                  </span>
                  <span className="text-body text-neutral-500">/tahun</span>
                </div>
                <p className="text-body-small text-green-600 font-semibold">
                  Hanya Rp25.000/bulan · Hemat Rp168.000!
                </p>
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-body text-neutral-700">Semua fitur paket bulanan</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-body text-neutral-700 font-semibold">Hemat 36% dari paket bulanan</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-body text-neutral-700">Bayar sekali untuk 12 bulan</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-body text-neutral-700">Tanpa khawatir perpanjangan bulanan</span>
                </li>
              </ul>

              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg">
                Pilih Paket Tahunan
              </button>
            </div>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="text-center animate-fade-in opacity-0 delay-300">
          <p className="text-body-small text-neutral-500 mb-2">
            💬 Butuh paket custom atau enterprise?
          </p>
          <a
            href="https://wa.me/628123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-small text-primary-600 hover:text-primary-700 font-semibold hover:underline"
          >
            Hubungi kami via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
