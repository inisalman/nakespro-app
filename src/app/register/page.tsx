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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pilih Paket Hemat
          </h1>
          <p className="text-lg text-gray-600">
            Mulai dengan template website yang terjangkau dan profesional
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly Plan */}
          <Link href="/templates?billing=monthly">
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer p-8 border-2 border-transparent hover:border-blue-500">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Hemat Bulanan
                </h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-blue-600">
                    Rp39.000
                  </span>
                  <span className="text-gray-600">/bulan</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Website template responsif
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Domain subdomain gratis
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Pembayaran bulanan fleksibel
                </li>
              </ul>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Lanjut ke Template
              </button>
            </div>
          </Link>

          {/* Yearly Plan */}
          <Link href="/templates?billing=yearly">
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer p-8 border-2 border-green-500 relative">
              <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                Hemat 36%
              </div>

              <div className="mb-6 mt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Hemat Tahunan
                </h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-green-600">
                    Rp300.000
                  </span>
                  <span className="text-gray-600">/tahun</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Rp25.000 per bulan
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Semua fitur paket bulanan
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Hemat hingga Rp168.000/tahun
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Komitmen tahunan, hemat maksimal
                </li>
              </ul>

              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                Lanjut ke Template
              </button>
            </div>
          </Link>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Bisa diubah atau upgrade melalui WhatsApp setelah mendaftar
          </p>
        </div>
      </div>
    </div>
  );
}
