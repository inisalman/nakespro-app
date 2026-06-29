import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { generateSOAPPDF, type SOAPData } from "@/lib/pdf";

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

  const soapData: SOAPData = {
    invoiceNumber: report.invoiceNumber,
    actionDate: report.actionDate,
    patientName: report.patientName,
    patientWaNumber: report.patientWaNumber,
    actionType: report.actionType,
    actionDescription: report.actionDescription,
    notes: report.notes,
    soapSubjective: report.soapSubjective,
    soapObjective: report.soapObjective,
    soapAssessment: report.soapAssessment,
    soapPlanning: report.soapPlanning,
    practitionerName: order?.fullName ?? session.user.name,
    practitionerPractice: order?.websiteName ?? null,
    practitionerLocation: order?.location ?? null,
  };

  try {
    const pdfBuffer = await generateSOAPPDF(soapData);

    const url = new URL(req.url);
    const isDownload = url.searchParams.get("download") === "1";

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": isDownload
          ? `attachment; filename="SOAP-${report.invoiceNumber}.pdf"`
          : `inline; filename="SOAP-${report.invoiceNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("SOAP PDF generation error:", err);
    return NextResponse.json(
      { error: `Gagal generate PDF SOAP: ${message}` },
      { status: 500 }
    );
  }
}
