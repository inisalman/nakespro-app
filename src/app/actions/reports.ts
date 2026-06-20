"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { ReportSchema, type ReportItem } from "@/lib/validations";

const VALID_STATUSES = ["draft", "sent", "paid"];

/** Buat nomor invoice berurutan: INV-2026-0001 */
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const count = await prisma.report.count({
    where: { invoiceNumber: { startsWith: prefix } },
  });

  // Sequence di-restart tiap tahun. +1 untuk record baru.
  const seq = (count + 1).toString().padStart(4, "0");
  return `${prefix}${seq}`;
}

function computeTotal(items: ReportItem[]): number {
  return items.reduce((sum, item) => sum + item.qty * item.price, 0);
}

/** Buat laporan tindakan + invoice baru. */
export async function createReport(
  data: Omit<
    z.infer<typeof ReportSchema>,
    "items"
  > & { items: ReportItem[] }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const validation = ReportSchema.safeParse(data);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Data tidak valid",
    };
  }

  const validated = validation.data;
  const totalAmount = computeTotal(validated.items);

  const invoiceNumber = await generateInvoiceNumber();

  const report = await prisma.report.create({
    data: {
      userId: session.user.id,
      invoiceNumber,
      patientName: validated.patientName,
      patientWaNumber: validated.patientWaNumber,
      actionDate: new Date(validated.actionDate),
      actionType: validated.actionType,
      actionDescription: validated.actionDescription || null,
      items: validated.items,
      notes: validated.notes || null,
      totalAmount,
    },
  });

  revalidatePath("/dashboard/laporan");

  return { success: true, reportId: report.id };
}

/** Hapus laporan. Hanya pemilik yang bisa. */
export async function deleteReport(reportId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { userId: true },
  });

  if (!report) {
    return { success: false, error: "Laporan tidak ditemukan" };
  }

  if (report.userId !== session.user.id) {
    return { success: false, error: "Unauthorized access" };
  }

  await prisma.report.delete({ where: { id: reportId } });

  revalidatePath("/dashboard/laporan");

  return { success: true };
}

/** Update status laporan (draft/sent/paid). Hanya pemilik. */
export async function updateReportStatus(
  reportId: string,
  status: string
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  if (!VALID_STATUSES.includes(status)) {
    return { success: false, error: "Status tidak valid" };
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { userId: true },
  });

  if (!report) {
    return { success: false, error: "Laporan tidak ditemukan" };
  }

  if (report.userId !== session.user.id) {
    return { success: false, error: "Unauthorized access" };
  }

  await prisma.report.update({
    where: { id: reportId },
    data: { status },
  });

  revalidatePath("/dashboard/laporan");

  return { success: true };
}
