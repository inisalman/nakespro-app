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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              NakesPro
            </h1>
            <p className="text-gray-600">
              Website Builder untuk Tenaga Kesehatan & Homecare
            </p>
          </div>

          <div className="space-y-4">
            <LoginButton />

            <div className="text-center text-sm text-gray-500">
              Dengan masuk, Anda menyetujui syarat & ketentuan kami
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <span className="font-semibold text-blue-600">
                Login otomatis membuat akun baru
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
