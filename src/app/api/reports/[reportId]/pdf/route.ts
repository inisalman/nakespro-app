import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { generateInvoicePDF, type InvoiceData } from "@/lib/pdf";
import type { ReportItem } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reportId } = await params;

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      user: {
        include: { orders: { take: 1, orderBy: { createdAt: "desc" } } },
      },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
  }

  if (report.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const order = report.user.orders[0] ?? null;

  // Normalisasi items: pastikan selalu array berisi item valid.
  // Kolom JSON bisa berbentuk tak terduga jika data lama/rusak.
  const rawItems = Array.isArray(report.items) ? report.items : [];
  const items: ReportItem[] = rawItems
    .filter(
      (it: unknown): it is ReportItem =>
        typeof it === "object" &&
        it !== null &&
        typeof (it as ReportItem).name === "string" &&
        typeof (it as ReportItem).qty === "number" &&
        typeof (it as ReportItem).price === "number"
    )
    .map((it) => ({
      name: String(it.name),
      qty: Number(it.qty) || 1,
      price: Number(it.price) || 0,
    }));

  if (items.length === 0) {
    return NextResponse.json(
      { error: "Laporan tidak memiliki item biaya" },
      { status: 400 }
    );
  }

  const invoiceData: InvoiceData = {
    invoiceNumber: report.invoiceNumber,
    actionDate: report.actionDate,
    patientName: report.patientName,
    patientWaNumber: report.patientWaNumber,
    actionType: report.actionType,
    actionDescription: report.actionDescription,
    items,
    notes: report.notes,
    totalAmount: report.totalAmount,
    practitionerName: order?.fullName ?? session.user.name,
    practitionerPractice: order?.websiteName ?? null,
    practitionerLocation: order?.location ?? null,
  };

  try {
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // ?download=1 → paksa download, default preview di browser
    const url = new URL(req.url);
    const isDownload = url.searchParams.get("download") === "1";

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": isDownload
          ? `attachment; filename="${report.invoiceNumber}.pdf"`
          : `inline; filename="${report.invoiceNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    // Sertakan pesan error agar mudah di-debug dari response/network tab.
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: `Gagal generate PDF: ${message}` },
      { status: 500 }
    );
  }
}
