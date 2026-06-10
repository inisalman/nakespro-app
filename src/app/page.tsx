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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Website Profesional untuk
            <br />
            <span className="text-blue-600">Tenaga Kesehatan</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Paket Hemat mulai Rp25.000/bulan. Website siap pakai, no coding required.
            Cocok untuk praktik mandiri, klinik, dan layanan homecare.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/login"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition shadow-lg"
            >
              Mulai Sekarang
            </Link>
            <a
              href="https://nakespro.id"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition border-2 border-gray-300"
            >
              Lihat Demo
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Cepat & Mudah
            </h3>
            <p className="text-gray-600">
              Website siap dalam 2-3 hari. Tinggal isi detail praktik, kami yang build.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Harga Terjangkau
            </h3>
            <p className="text-gray-600">
              Mulai Rp25.000/bulan (bulanan) atau Rp300.000/tahun (hemat 2 bulan).
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Template Profesional
            </h3>
            <p className="text-gray-600">
              Pilih dari 4 template khusus nakes & homecare. Responsive & modern.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Siap Mulai?
          </h2>
          <p className="text-gray-600 mb-6">
            Login dengan Google untuk mulai membuat website Anda
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition shadow-lg"
          >
            Login & Pesan Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
