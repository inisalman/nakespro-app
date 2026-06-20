import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LaporanFormClient from "./laporan-form-client";

export default async function BuatLaporanPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  // Ambil order terbaru untuk default tanggal hari ini
  const latestOrder = await prisma.order.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full flex-1 p-6 lg:p-10 max-w-4xl mx-auto animate-fade-in-up">
      {/* Back link */}
      <Link
        href="/dashboard/laporan"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali ke Daftar Laporan
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">
          Buat Laporan Tindakan Baru
        </h1>
        <p className="text-body text-neutral-500">
          Isi detail tindakan yang dilakukan, lalu invoice akan otomatis dibuat.
        </p>
      </div>

      <LaporanFormClient />
    </div>
  );
}
