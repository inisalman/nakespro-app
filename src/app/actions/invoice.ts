"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmin } from "@/lib/telegram";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Klaim pembayaran untuk invoice perpanjangan langganan.
 * Mirip claimPayment() tapi targetnya Invoice, bukan Order.
 */
export async function claimInvoicePayment(
  invoiceId: string,
  proofBase64: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { order: true },
  });

  if (!invoice) {
    return { success: false, error: "Tagihan tidak ditemukan" };
  }

  if (invoice.userId !== session.user.id) {
    return { success: false, error: "Unauthorized access" };
  }

  if (invoice.status !== "pending") {
    return { success: false, error: "Tagihan sudah diproses sebelumnya" };
  }

  // Update invoice status jadi "claimed"
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: "claimed",
      paymentProofUrl: proofBase64,
    },
  });

  await notifyAdmin(
    `🧾 Pembayaran Perpanjangan Diklaim

Tagihan: ${invoice.invoiceNumber}
Order ID: ${invoice.orderId}
Website: ${invoice.order.websiteName || "Belum diisi"}
Client: ${session.user.email}
Total: Rp${invoice.totalAmount.toLocaleString("id-ID")}
Periode: ${invoice.periodStart.toLocaleDateString("id-ID")} - ${invoice.periodEnd.toLocaleDateString("id-ID")}

Bukti pembayaran telah diupload. Silakan verifikasi di admin panel.`,
  );

  revalidatePath("/dashboard/langganan");

  return { success: true };
}
