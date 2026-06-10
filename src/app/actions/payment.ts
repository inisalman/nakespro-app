"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmin } from "@/lib/telegram";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PaymentClaimSchema } from "@/lib/validations";

export async function claimPayment(orderId: string, proofBase64: string) {
  // Get session
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate orderId
  const validation = PaymentClaimSchema.safeParse({ orderId });
  if (!validation.success) {
    return { success: false, error: "Invalid order ID" };
  }

  // Fetch order and validate ownership
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return { success: false, error: "Order tidak ditemukan" };
  }

  if (order.userId !== session.user.id) {
    return { success: false, error: "Unauthorized access" };
  }

  if (order.paymentStatus === "claimed" || order.paymentStatus === "paid") {
    return { success: false, error: "Pembayaran sudah diklaim sebelumnya" };
  }

  // Update order status
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "claimed",
      paymentProofUrl: proofBase64, // Store base64 for MVP
      lastPaidAt: new Date(),
    },
  });

  // Send Telegram notification to admin
  await notifyAdmin(`🔔 Pembayaran Diklaim

Order ID: ${orderId}
Amount: Rp${updatedOrder.totalAmount.toLocaleString("id-ID")}
Template: ${updatedOrder.templateId}
Paket: ${updatedOrder.billingCycle === "monthly" ? "Bulanan" : "Tahunan"}

Bukti pembayaran telah diupload. Silakan verifikasi di admin panel.

Link Admin: https://app.nakespro.id/admin/orders/${orderId}`);

  return { success: true };
}
