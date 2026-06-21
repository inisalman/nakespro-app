"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmin } from "@/lib/telegram";
import { addBillingInterval } from "@/lib/billing";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [];

async function validateAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }
  if (!ADMIN_EMAILS.includes(session.user.email)) {
    return { error: "Admin access required" };
  }
  return { session };
}

export async function confirmPayment(orderId: string) {
  const validation = await validateAdmin();
  if ("error" in validation) {
    return { success: false, error: validation.error };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) {
    return { success: false, error: "Order tidak ditemukan" };
  }

  if (order.paymentStatus !== "claimed") {
    return { success: false, error: "Payment belum diklaim oleh client" };
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "paid",
      buildStatus: "payment_confirmed",
      lastPaidAt: new Date(),
    },
  });

  await notifyAdmin(`✅ Pembayaran Dikonfirmasi

Order ID: ${orderId}
Website: ${updatedOrder.websiteName || "Belum diisi"}
Client: ${order.user.name} (${order.user.email})
Total: Rp${updatedOrder.totalAmount.toLocaleString("id-ID")}

Status berubah ke: payment_confirmed
Siap untuk mulai build.

Link Admin: https://app.nakespro.id/admin/orders/${orderId}`);

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);

  return { success: true };
}

export async function updateBuildStatus(orderId: string, newStatus: string) {
  const validation = await validateAdmin();
  if ("error" in validation) {
    return { success: false, error: validation.error };
  }

  const validStatuses = [
    "awaiting_payment",
    "payment_confirmed",
    "designing",
    "review",
    "done",
  ];
  if (!validStatuses.includes(newStatus)) {
    return { success: false, error: "Status tidak valid" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return { success: false, error: "Order tidak ditemukan" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { buildStatus: newStatus },
  });

  await notifyAdmin(`🔄 Build Status Diupdate

Order ID: ${orderId}
Website: ${order.websiteName || "Belum diisi"}
Status baru: ${newStatus}

Link Admin: https://app.nakespro.id/admin/orders/${orderId}`);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");

  return { success: true };
}

/**
 * Konfirmasi pembayaran invoice perpanjangan langganan oleh admin.
 * Update status Invoice → "paid", extend nextBillingDate di Order.
 */
export async function confirmInvoicePayment(invoiceId: string) {
  const validation = await validateAdmin();
  if ("error" in validation) {
    return { success: false, error: validation.error };
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { order: { include: { user: true } }, user: true },
  });

  if (!invoice) {
    return { success: false, error: "Invoice tidak ditemukan" };
  }

  if (invoice.status !== "claimed") {
    return { success: false, error: "Invoice belum diklaim oleh client" };
  }

  // Update invoice jadi paid
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: "paid",
      paidAt: new Date(),
    },
  });

  // Extend nextBillingDate di order satu siklus ke depan
  const nextBilling = addBillingInterval(
    invoice.periodEnd,
    invoice.billingCycle,
  );

  await prisma.order.update({
    where: { id: invoice.orderId },
    data: {
      isActive: true,
      nextBillingDate: nextBilling,
      lastPaidAt: new Date(),
    },
  });

  await notifyAdmin(
    `✅ Pembayaran Perpanjangan Dikonfirmasi

Tagihan: ${invoice.invoiceNumber}
Order ID: ${invoice.orderId}
Website: ${invoice.order.websiteName || "Belum diisi"}
Client: ${invoice.user.name} (${invoice.user.email})
Total: Rp${invoice.totalAmount.toLocaleString("id-ID")}
Periode: ${invoice.periodStart.toLocaleDateString("id-ID")} — ${invoice.periodEnd.toLocaleDateString("id-ID")}
Tagihan berikutnya: ${nextBilling.toLocaleDateString("id-ID")}

Langganan diperpanjang otomatis!`,
  );

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/orders/${invoice.orderId}`);
  revalidatePath("/admin");

  return { success: true };
}

export async function publishWebsite(
  orderId: string,
  websiteUrl: string
) {
  const validation = await validateAdmin();
  if ("error" in validation) {
    return { success: false, error: validation.error };
  }

  if (!websiteUrl || !websiteUrl.startsWith("http")) {
    return { success: false, error: "URL website tidak valid" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) {
    return { success: false, error: "Order tidak ditemukan" };
  }

  if (order.buildStatus !== "done") {
    return {
      success: false,
      error: "Build status harus 'done' sebelum publish",
    };
  }

  const liveAt = new Date();
  const nextBillingDate = addBillingInterval(liveAt, order.billingCycle);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      websiteUrl,
      isActive: true,
      lastPaidAt: order.lastPaidAt ?? liveAt,
      nextBillingDate,
    },
  });

  await notifyAdmin(`🎉 Website Published!

Order ID: ${orderId}
Website: ${order.websiteName}
URL: ${websiteUrl}
Client: ${order.user.name} (${order.user.email})
Siklus: ${order.billingCycle === "yearly" ? "Tahunan" : "Bulanan"}
Tagihan berikutnya: ${nextBillingDate.toLocaleDateString("id-ID")}

Website sekarang live dan aktif!

Link Admin: https://app.nakespro.id/admin/orders/${orderId}`);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function saveAdminNotes(orderId: string, notes: string) {
  const validation = await validateAdmin();
  if ("error" in validation) {
    return { success: false, error: validation.error };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return { success: false, error: "Order tidak ditemukan" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { adminNotes: notes },
  });

  revalidatePath(`/admin/orders/${orderId}`);

  return { success: true };
}
