"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmin } from "@/lib/telegram";
import { addBillingInterval } from "@/lib/billing";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Generate nomor tagihan berurutan: TAG-2026-0001
 * Berbeda prefix dari invoice pasien (INV-) agar mudah dibedakan.
 */
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TAG-${year}-`;

  const count = await prisma.invoice.count({
    where: { invoiceNumber: { startsWith: prefix } },
  });

  // Sequence di-restart tiap tahun. +1 untuk record baru.
  const seq = (count + 1).toString().padStart(4, "0");
  return `${prefix}${seq}`;
}

/**
 * Buat tagihan perpanjangan langganan untuk satu siklus ke depan.
 *
 * Dipanggil nakes dari halaman /dashboard/langganan. Membuat record Invoice
 * berstatus "pending" yang lalu dibayar via flow QRIS yang sudah ada.
 */
export async function createRenewalInvoice(orderId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  // Ambil order + validasi kepemilikan
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return { success: false, error: "Langganan tidak ditemukan" };
  }

  if (order.userId !== session.user.id) {
    return { success: false, error: "Unauthorized access" };
  }

  // Hanya bisa perpanjang kalau website sudah live (build done & isActive).
  if (order.buildStatus !== "done") {
    return {
      success: false,
      error: "Website belum live, perpanjangan belum tersedia",
    };
  }

  // Anti-duplikat: cek apakah masih ada tagihan yang belum lunas.
  const outstanding = await prisma.invoice.findFirst({
    where: {
      orderId,
      status: { in: ["pending", "claimed"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (outstanding) {
    return {
      success: false,
      error: "Masih ada tagihan yang menunggu pembayaran",
    };
  }

  // Hitung periode: mulai dari tanggal tagihan berikutnya (atau sekarang
  // kalau belum pernah ditagih), berakhir satu siklus kemudian.
  const periodStart = order.nextBillingDate ?? new Date();
  const periodEnd = addBillingInterval(periodStart, order.billingCycle);

  // Generate kode unik baru supaya QRIS bisa dibedakan per transaksi.
  const uniqueCode = Math.floor(Math.random() * 1000);
  const totalAmount = order.baseAmount + uniqueCode;

  const invoiceNumber = await generateInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      userId: session.user.id,
      orderId,
      invoiceNumber,
      billingCycle: order.billingCycle,
      periodStart,
      periodEnd,
      baseAmount: order.baseAmount,
      uniqueCode,
      totalAmount,
      status: "pending",
    },
  });

  await notifyAdmin(`🧾 Tagihan Perpanjangan Dibuat

Tagihan: ${invoiceNumber}
Order ID: ${orderId}
Website: ${order.websiteName || "Belum diisi"}
Client: ${session.user.email}
Siklus: ${order.billingCycle === "yearly" ? "Tahunan" : "Bulanan"}
Total: Rp${totalAmount.toLocaleString("id-ID")}
Periode: ${periodStart.toLocaleDateString("id-ID")} - ${periodEnd.toLocaleDateString("id-ID")}

Menunggu pembayaran dari client.`);

  revalidatePath("/dashboard/langganan");

  return { success: true, invoiceId: invoice.id };
}
