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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-primary-50/50 to-white px-4 py-12">
      {/* Card */}
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="mb-8 text-center">
          <Link
            href="https://nakespro.id"
            className="inline-flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900">
              NakesPro
            </span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-neutral-200/60 bg-white px-6 py-10 shadow-sm sm:px-10">
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-neutral-900">
              Masuk ke NakesPro
            </h1>
            <p className="text-sm text-neutral-500">
              Kelola website profesional Anda dengan mudah
            </p>
          </div>

          {/* Login Button */}
          <LoginButton />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-neutral-400">
                atau
              </span>
            </div>
          </div>

          {/* Auto-register info */}
          <p className="text-center text-sm text-neutral-500">
            Belum punya akun?{" "}
            <span className="font-semibold text-neutral-900">
              Login otomatis membuat akun baru
            </span>
          </p>
        </div>

        {/* Trust */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-neutral-100 bg-white/60 px-5 py-2 backdrop-blur-sm">
            <div className="flex -space-x-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-primary-200 to-primary-300"
                />
              ))}
            </div>
            <span className="text-xs font-medium text-neutral-600">
              Dipercaya <span className="text-neutral-900">200+</span> praktisi
              kesehatan
            </span>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-8 text-center text-xs text-neutral-400">
          Dengan masuk, Anda menyetujui{" "}
          <a href="#" className="font-medium text-neutral-600 hover:text-neutral-900 underline underline-offset-2">
            Syarat & Ketentuan
          </a>{" "}
          dan{" "}
          <a href="#" className="font-medium text-neutral-600 hover:text-neutral-900 underline underline-offset-2">
            Kebijakan Privasi
          </a>
        </p>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="https://nakespro.id"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-600"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda NakesPro
          </Link>
        </div>
      </div>
    </div>
  );
}
