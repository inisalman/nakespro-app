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
    <div className="flex min-h-[100dvh]">
      {/* Left Panel - Brand / Visual */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#0C1929] overflow-hidden select-none">
        {/* Subtle ambient orbs */}
        <div className="absolute -top-48 -right-24 w-[32rem] h-[32rem] bg-emerald-500/8 rounded-full blur-[120px]" />
        <div className="absolute -bottom-48 -left-24 w-[36rem] h-[36rem] bg-cyan-500/8 rounded-full blur-[120px]" />

        {/* Faint grid texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Brand */}
          <Link
            href="https://nakespro.id"
            className="inline-flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[#0C1929]"
                fill="none"
                viewBox="0 0 20 20"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 2v16M2 10h16"
                />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white/90">
              NakesPro
            </span>
          </Link>

          {/* Center: calm value prop */}
          <div className="flex-1 flex items-center">
            <div className="space-y-4 max-w-sm">
              <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight tracking-tight text-white">
                Website profesional
                <br />
                untuk tenaga kesehatan
              </h1>
              <p className="text-base leading-relaxed text-white/50">
                Kelola website, jadwal, dan profil praktik Anda dalam satu
                platform. Tanpa ribet, tanpa perlu coding.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-white/20">
            &copy; 2025 NakesPro
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-white">
        <div className="w-full max-w-sm">
          {/* Back link */}
          <Link
            href="https://nakespro.id"
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-700 transition-colors mb-10 group"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="text-sm">Kembali</span>
          </Link>

          {/* Form header */}
          <div className="mb-10">
            {/* Mobile brand indicator */}
            <div className="flex items-center gap-2 lg:hidden mb-8">
              <div className="w-8 h-8 rounded-lg bg-[#0C1929] flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 20 20"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 2v16M2 10h16"
                  />
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight text-[#0C1929]">
                NakesPro
              </span>
            </div>

            <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-tight text-neutral-900 mb-2">
              Masuk ke akun Anda
            </h2>
            <p className="text-sm text-neutral-500">
              Kelola website profesional Anda dengan mudah
            </p>
          </div>

          {/* Login action */}
          <div className="space-y-6">
            <LoginButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-xs text-neutral-400 bg-white">
                  atau
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-neutral-500">
              Belum punya akun?{" "}
              <span className="font-semibold text-neutral-800">
                Login otomatis membuat akun baru
              </span>
            </p>
          </div>

          {/* Terms */}
          <p className="mt-10 text-xs leading-relaxed text-neutral-400 text-center">
            Dengan masuk, Anda menyetujui{" "}
            <a
              href="#"
              className="text-neutral-600 hover:text-neutral-900 underline underline-offset-2 transition-colors"
            >
              Syarat & Ketentuan
            </a>{" "}
            dan{" "}
            <a
              href="#"
              className="text-neutral-600 hover:text-neutral-900 underline underline-offset-2 transition-colors"
            >
              Kebijakan Privasi
            </a>{" "}
            kami
          </p>
        </div>
      </div>
    </div>
  );
}
