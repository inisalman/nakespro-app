import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LoginButton from "./login-button";
import Link from "next/link";

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // If already logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Bold Hero with Gradient */}
      <div className="relative gradient-hero overflow-hidden flex items-center justify-center p-6 sm:p-8 lg:p-16">
        {/* Decorative geometric shapes */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border-2 border-white/30 rounded-3xl rotate-12"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-xl text-white">
          <div className="animate-fade-in-up opacity-0">
            <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              Platform Website Builder #1 untuk Nakes
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 animate-fade-in-up opacity-0 delay-100">
            Website Profesional dalam Hitungan Hari
          </h1>

          <p className="text-base sm:text-lg lg:text-xl opacity-90 mb-6 sm:mb-8 animate-fade-in-up opacity-0 delay-200">
            Bergabung dengan ratusan tenaga kesehatan yang sudah memiliki website profesional.
            Mulai dari Rp25.000/bulan.
          </p>

          <div className="space-y-3 sm:space-y-4 animate-fade-in-up opacity-0 delay-300">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-base sm:text-lg">4 template profesional ready-to-use</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-base sm:text-lg">Live dalam 2-3 hari kerja</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-base sm:text-lg">Domain gratis .nakespro.id</span>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/20 animate-fade-in opacity-0 delay-400">
            <p className="text-xs sm:text-sm opacity-75 mb-3">Dipercaya oleh profesional kesehatan:</p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white/50"></div>
                ))}
              </div>
              <span className="text-xs sm:text-sm font-semibold ml-2">+200 praktisi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Clean Form Area */}
      <div className="flex items-center justify-center p-6 sm:p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          <div className="animate-scale-in opacity-0 delay-200">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-6 sm:mb-8"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-xs sm:text-sm font-medium">Kembali ke Beranda</span>
            </Link>

            <div className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">
                Masuk ke NakesPro
              </h2>
              <p className="text-sm sm:text-base text-neutral-600">
                Kelola website profesional Anda dengan mudah
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <LoginButton />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-4 bg-white text-neutral-500">atau</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs sm:text-sm text-neutral-600">
                  Belum punya akun?{" "}
                  <span className="font-semibold text-neutral-900">
                    Login otomatis membuat akun baru
                  </span>
                </p>
              </div>

              <div className="pt-4 sm:pt-6 border-t border-neutral-100">
                <p className="text-xs text-neutral-500 text-center">
                  Dengan masuk, Anda menyetujui{" "}
                  <a href="#" className="text-neutral-900 hover:underline font-medium">
                    Syarat & Ketentuan
                  </a>
                  {" "}dan{" "}
                  <a href="#" className="text-neutral-900 hover:underline font-medium">
                    Kebijakan Privasi
                  </a>
                  {" "}kami
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
