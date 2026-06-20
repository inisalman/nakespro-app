import PDFDocument from "pdfkit";
import type { ReportItem } from "@/lib/validations";

export interface InvoiceData {
  invoiceNumber: string;
  actionDate: Date;
  patientName: string;
  patientWaNumber: string;
  actionType: string;
  actionDescription?: string | null;
  items: ReportItem[];
  notes?: string | null;
  totalAmount: number;
  // Data nakes (dari Order)
  practitionerName?: string | null;
  practitionerPractice?: string | null;
  practitionerLocation?: string | null;
}

const COLOR = {
  primary: "#0284c7", // primary-600 dari globals.css
  dark: "#171717",   // neutral-900
  gray: "#737373",    // neutral-500
  lightGray: "#e5e5e5", // neutral-200
  white: "#ffffff",
  bg: "#f5f5f5",     // neutral-100
};

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageW = doc.page.width;
    const contentW = pageW - 100; // 50 margin kiri + kanan

    // ─── Background ───
    doc.rect(0, 0, pageW, 110).fill(COLOR.primary);
    doc.rect(0, 110, pageW, 3).fill(COLOR.dark);

    // ─── Header ───
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor(COLOR.white)
      .text("INVOICE", 50, 30, { align: "left" });

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#bae6fd")
      .text(data.invoiceNumber, 50, 58, { align: "left" });

    // Nama praktik nakes di kanan atas
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor(COLOR.white)
      .text(data.practitionerPractice || "NakesPro", 50, 80, {
        width: contentW,
        align: "right",
      });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#bae6fd")
      .text(data.practitionerLocation || "Lokasi", 50, 96, {
        width: contentW,
        align: "right",
      });

    // ─── Info Pasien & Tanggal ───
    const infoY = 135;
    doc.rect(50, infoY, contentW, 70).fill(COLOR.bg).stroke(COLOR.lightGray);

    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLOR.gray);
    doc.text("PASIEN", 65, infoY + 10);
    doc.text("TANGGAL TINDAKAN", 65 + contentW / 2, infoY + 10);

    doc.font("Helvetica-Bold").fontSize(12).fillColor(COLOR.dark);
    doc.text(data.patientName, 65, infoY + 25);
    doc.text(formatDate(data.actionDate), 65 + contentW / 2, infoY + 25);

    doc.font("Helvetica").fontSize(9).fillColor(COLOR.gray);
    doc.text(`WA: ${data.patientWaNumber}`, 65, infoY + 42);

    // ─── Detail Tindakan ───
    let y = infoY + 90;
    doc.font("Helvetica-Bold").fontSize(11).fillColor(COLOR.dark);
    doc.text("Detail Tindakan", 50, y);
    y += 20;

    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLOR.gray);
    doc.text("Jenis:", 65, y);
    doc.font("Helvetica").fillColor(COLOR.dark);
    doc.text(data.actionType, 120, y);
    y += 15;

    if (data.actionDescription) {
      doc.font("Helvetica-Bold").fontSize(9).fillColor(COLOR.gray);
      doc.text("Keterangan:", 65, y);
      doc.font("Helvetica").fillColor(COLOR.dark);
      doc.text(data.actionDescription, 145, y, { width: contentW - 95 });
      y += 20;
    }

    y += 10;

    // ─── Tabel Line Items ───
    doc.font("Helvetica-Bold").fontSize(11).fillColor(COLOR.dark);
    doc.text("Rincian Biaya", 50, y);
    y += 18;

    const tableX = 50;
    const colNo = 40;
    const colItem = contentW - colNo - 90 - 110;
    const colQty = 90;
    const colSub = 110;

    // Table header
    doc.rect(tableX, y, contentW, 22).fill("#0c4a6e");
    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLOR.white);
    doc.text("No", tableX + 8, y + 6, { width: colNo });
    doc.text("Item", tableX + colNo + 8, y + 6, { width: colItem });
    doc.text("Qty", tableX + colNo + colItem + 8, y + 6, { width: colQty, align: "center" });
    doc.text("Subtotal", tableX + colNo + colItem + colQty + 8, y + 6, { width: colSub, align: "right" });
    y += 22;

    // Table rows
    doc.font("Helvetica").fontSize(9).fillColor(COLOR.dark);
    data.items.forEach((item, i) => {
      const rowH = 22;
      if (i % 2 === 0) {
        doc.rect(tableX, y, contentW, rowH).fill("#f9fafb");
      }
      doc
        .fillColor(COLOR.dark)
        .text(`${i + 1}`, tableX + 8, y + 6, { width: colNo })
        .text(item.name, tableX + colNo + 8, y + 6, { width: colItem })
        .text(`${item.qty}`, tableX + colNo + colItem + 8, y + 6, { width: colQty, align: "center" })
        .text(rupiah(item.qty * item.price), tableX + colNo + colItem + colQty + 8, y + 6, {
          width: colSub,
          align: "right",
        });
      y += rowH;
    });

    // Table border bottom
    doc.moveTo(tableX, y).lineTo(tableX + contentW, y).stroke(COLOR.lightGray);
    y += 15;

    // ─── Total ───
    doc.rect(tableX + contentW - colSub, y, colSub, 28).fill(COLOR.primary);
    doc.font("Helvetica-Bold").fontSize(11).fillColor(COLOR.white);
    doc.text(rupiah(data.totalAmount), tableX + contentW - colSub + 8, y + 8, {
      width: colSub - 16,
      align: "right",
    });
    y += 40;

    // ─── Catatan ───
    if (data.notes) {
      doc.font("Helvetica-Bold").fontSize(9).fillColor(COLOR.gray);
      doc.text("Catatan:", 50, y);
      doc.font("Helvetica").fontSize(9).fillColor(COLOR.dark);
      doc.text(data.notes, 100, y, { width: contentW - 50 });
      y += 30;
    }

    // ─── Footer ───
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLOR.gray)
      .text(
        "Invoice ini dibuat secara otomatis oleh NakesPro. Terima kasih atas kepercayaan Anda.",
        50,
        doc.page.height - 60,
        { width: contentW, align: "center" }
      );

    doc.end();
  });
}
