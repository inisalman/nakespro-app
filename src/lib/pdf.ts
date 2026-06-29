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
  // SOAP
  soapSubjective?: string | null;
  soapObjective?: string | null;
  soapAssessment?: string | null;
  soapPlanning?: string | null;
}

export interface SOAPData {
  invoiceNumber: string;
  actionDate: Date;
  patientName: string;
  patientWaNumber: string;
  actionType: string;
  actionDescription?: string | null;
  notes?: string | null;
  soapSubjective?: string | null;
  soapObjective?: string | null;
  soapAssessment?: string | null;
  soapPlanning?: string | null;
  practitionerName?: string | null;
  practitionerPractice?: string | null;
  practitionerLocation?: string | null;
}

const COLOR = {
  primary: "#0284c7",       // Sky-600 (Modern Corporate Blue)
  primaryLight: "#f0f9ff",  // Sky-50
  textDark: "#0f172a",      // Slate-900 (Rich dark gray)
  textMuted: "#475569",     // Slate-600 (Muted readable gray)
  border: "#e2e8f0",        // Slate-200 (Clean line)
  borderDark: "#cbd5e1",    // Slate-300
  bgLight: "#f8fafc",       // Slate-50 (Very light gray bg)
  white: "#ffffff",
  accent: "#bae6fd",       // Sky-200

  // SOAP Clinical Colors
  subjective: "#d97706",    // Amber-600
  subjectiveBg: "#fef3c7",  // Amber-100
  objective: "#2563eb",     // Blue-600
  objectiveBg: "#dbeafe",    // Blue-100
  assessment: "#059669",    // Emerald-600
  assessmentBg: "#d1fae5",  // Emerald-100
  planning: "#7c3aed",      // Purple-600
  planningBg: "#f3e8ff",    // Purple-100
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
    const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageW = doc.page.width;
    const contentW = pageW - 100; // 50 margin kiri + kanan

    // ---------------------------------------------
    // PAGE 1: INVOICE
    // ---------------------------------------------
    
    // Top thin accent bar
    doc.rect(0, 0, pageW, 6).fill(COLOR.primary);

    // Header logo & title
    doc.font("Helvetica-Bold").fontSize(20).fillColor(COLOR.primary);
    doc.text(data.practitionerPractice || "NakesPro", 50, 40);
    
    doc.font("Helvetica").fontSize(9).fillColor(COLOR.textMuted);
    doc.text(data.practitionerLocation || "", 50, 65, { width: contentW * 0.5 });

    doc.font("Helvetica-Bold").fontSize(24).fillColor(COLOR.textDark);
    doc.text("INVOICE", 50, 40, { align: "right" });
    
    doc.font("Helvetica-Bold").fontSize(10).fillColor(COLOR.primary);
    doc.text(data.invoiceNumber, 50, 68, { align: "right" });
    
    doc.font("Helvetica").fontSize(9).fillColor(COLOR.textMuted);
    doc.text(`Tanggal: ${formatDate(data.actionDate)}`, 50, 82, { align: "right" });

    // Divider line
    doc.moveTo(50, 115).lineTo(pageW - 50, 115).strokeColor(COLOR.border).lineWidth(1).stroke();

    // Bill To & From Section
    const colY = 135;
    
    // Bill To
    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLOR.textMuted);
    doc.text("DITAGIHKAN KEPADA", 50, colY);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(COLOR.textDark);
    doc.text(data.patientName, 50, colY + 14);
    doc.font("Helvetica").fontSize(9).fillColor(COLOR.textMuted);
    doc.text(`No. WA: ${data.patientWaNumber}`, 50, colY + 30);

    // Bill From
    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLOR.textMuted);
    doc.text("DIKELUARKAN OLEH", 50 + contentW * 0.55, colY);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(COLOR.textDark);
    doc.text(data.practitionerName || "Praktisi Medis", 50 + contentW * 0.55, colY + 14);
    doc.font("Helvetica").fontSize(9).fillColor(COLOR.textMuted);
    doc.text("Mitra NakesPro", 50 + contentW * 0.55, colY + 30);

    // Action info block
    const actionY = colY + 60;
    doc.rect(50, actionY, contentW, 40).fill(COLOR.bgLight).stroke(COLOR.border);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLOR.textDark).text("Tindakan Medis:", 65, actionY + 10);
    doc.font("Helvetica").fontSize(9).fillColor(COLOR.textMuted).text(data.actionType, 150, actionY + 10);
    
    if (data.actionDescription) {
      doc.font("Helvetica-Bold").fontSize(9).fillColor(COLOR.textDark).text("Keterangan:", 65, actionY + 24);
      doc.font("Helvetica").fontSize(9).fillColor(COLOR.textMuted).text(data.actionDescription, 150, actionY + 24, { width: contentW - 170 });
    }

    // Items table
    let y = actionY + 60;
    doc.font("Helvetica-Bold").fontSize(11).fillColor(COLOR.textDark).text("Rincian Biaya", 50, y);
    y += 18;

    const tableX = 50;
    const colNo = 40;
    const colItem = contentW - colNo - 80 - 110;
    const colQty = 80;
    const colSub = 110;

    // Table Header
    doc.rect(tableX, y, contentW, 24).fill(COLOR.primaryLight);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLOR.textDark);
    doc.text("No", tableX + 8, y + 7, { width: colNo });
    doc.text("Item / Layanan", tableX + colNo + 8, y + 7, { width: colItem });
    doc.text("Qty", tableX + colNo + colItem + 8, y + 7, { width: colQty, align: "center" });
    doc.text("Subtotal", tableX + colNo + colItem + colQty, y + 7, { width: colSub - 8, align: "right" });
    y += 24;

    // Table Rows
    doc.font("Helvetica").fontSize(9).fillColor(COLOR.textDark);
    data.items.forEach((item, i) => {
      const rowH = 24;
      // Soft borders for modern look
      doc.rect(tableX, y, contentW, rowH).stroke(COLOR.border);
      if (i % 2 === 1) {
        doc.rect(tableX + 1, y + 1, contentW - 2, rowH - 2).fill(COLOR.bgLight);
      }
      doc
        .fillColor(COLOR.textDark)
        .text(`${i + 1}`, tableX + 8, y + 8, { width: colNo })
        .text(item.name, tableX + colNo + 8, y + 8, { width: colItem })
        .text(`${item.qty}`, tableX + colNo + colItem + 8, y + 8, { width: colQty, align: "center" })
        .text(rupiah(item.qty * item.price), tableX + colNo + colItem + colQty, y + 8, {
          width: colSub - 8,
          align: "right",
        });
      y += rowH;
    });

    y += 10;

    // Total Amount Box
    doc.rect(tableX + contentW - colSub - 100, y, colSub + 100, 32).fill(COLOR.primary);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLOR.accent).text("TOTAL TAGIHAN", tableX + contentW - colSub - 90, y + 11);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(COLOR.white).text(rupiah(data.totalAmount), tableX + contentW - colSub - 90, y + 9, {
      width: colSub + 80,
      align: "right",
    });
    
    y += 45;

    // Notes
    if (data.notes) {
      doc.font("Helvetica-Bold").fontSize(9).fillColor(COLOR.textDark).text("Catatan Pembayaran / Instruksi:", 50, y);
      y += 14;
      doc.font("Helvetica").fontSize(9).fillColor(COLOR.textMuted).text(data.notes, 50, y, { width: contentW });
    }

    // ---------------------------------------------
    // PAGE 2: CLINICAL REPORT (SOAP)
    // ---------------------------------------------
    const hasSoap = !!(data.soapSubjective || data.soapObjective || data.soapAssessment || data.soapPlanning);
    if (hasSoap) {
      doc.addPage();
      
      // Page 2 Accent bar
      doc.rect(0, 0, pageW, 6).fill(COLOR.primary);

      // Header logo & title for Page 2
      doc.font("Helvetica-Bold").fontSize(18).fillColor(COLOR.primary);
      doc.text(data.practitionerPractice || "NakesPro", 50, 40);
      
      doc.font("Helvetica").fontSize(9).fillColor(COLOR.textMuted);
      doc.text("Laporan Rekam Medis Pasien", 50, 62);

      doc.font("Helvetica-Bold").fontSize(18).fillColor(COLOR.textDark);
      doc.text("LAPORAN TINDAKAN (SOAP)", 50, 40, { align: "right" });
      
      doc.font("Helvetica-Bold").fontSize(10).fillColor(COLOR.textMuted);
      doc.text(`SOAP-${data.invoiceNumber.split("-").slice(1).join("-")}`, 50, 62, { align: "right" });
      
      doc.font("Helvetica").fontSize(9).fillColor(COLOR.textMuted);
      doc.text(`Tanggal Tindakan: ${formatDate(data.actionDate)}`, 50, 76, { align: "right" });

      // Divider line
      doc.moveTo(50, 105).lineTo(pageW - 50, 105).strokeColor(COLOR.border).lineWidth(1).stroke();

      // Info Pasien & Pemeriksa
      const p2InfoY = 120;
      doc.rect(50, p2InfoY, contentW, 60).fill(COLOR.bgLight).stroke(COLOR.border);

      doc.font("Helvetica-Bold").fontSize(8).fillColor(COLOR.textMuted);
      doc.text("NAMA PASIEN", 65, p2InfoY + 12);
      doc.text("PRAKTISI MEDIS", 65 + contentW * 0.4, p2InfoY + 12);
      doc.text("TINDAKAN", 65 + contentW * 0.7, p2InfoY + 12);

      doc.font("Helvetica-Bold").fontSize(10).fillColor(COLOR.textDark);
      doc.text(data.patientName, 65, p2InfoY + 24, { width: contentW * 0.35 - 15 });
      doc.text(data.practitionerName || "Nakes", 65 + contentW * 0.4, p2InfoY + 24, { width: contentW * 0.3 - 15 });
      doc.text(data.actionType, 65 + contentW * 0.7, p2InfoY + 24, { width: contentW * 0.3 - 15 });

      // SOAP content rendering
      let soapY = p2InfoY + 75;

      const renderSOAPP2Box = (title: string, content: string | undefined | null, color: string, bg: string, labelChar: string) => {
        const text = content && content.trim() ? content.trim() : "Tidak ada catatan klinis.";
        
        doc.font("Helvetica-Bold").fontSize(10).fillColor(COLOR.textDark);
        doc.rect(50, soapY, 18, 18).fill(color);
        doc.fillColor(COLOR.white).text(labelChar, 50, soapY + 4, { width: 18, align: "center" });

        doc.fillColor(COLOR.textDark).text(title, 76, soapY + 3);
        soapY += 24;

        doc.font("Helvetica").fontSize(9);
        const textH = doc.heightOfString(text, { width: contentW - 24 });
        const boxH = textH + 16;

        doc.rect(50, soapY, contentW, boxH).fill(bg).stroke(COLOR.border);
        doc.fillColor(COLOR.textDark).text(text, 62, soapY + 8, { width: contentW - 24, lineGap: 1.5 });

        soapY += boxH + 18;
      };

      renderSOAPP2Box("Subjektif (S) - Keluhan & Anamnesis", data.soapSubjective, COLOR.subjective, COLOR.subjectiveBg, "S");
      renderSOAPP2Box("Objektif (O) - Pemeriksaan Fisik & Penunjang", data.soapObjective, COLOR.objective, COLOR.objectiveBg, "O");
      renderSOAPP2Box("Asesmen (A) - Diagnosis & Analisis", data.soapAssessment, COLOR.assessment, COLOR.assessmentBg, "A");
      
      // Auto-wrap page check for Planning (P)
      if (soapY > doc.page.height - 180) {
        doc.addPage();
        doc.rect(0, 0, pageW, 6).fill(COLOR.primary);
        soapY = 50;
      }
      renderSOAPP2Box("Planning (P) - Terapi & Rencana Lanjut", data.soapPlanning, COLOR.planning, COLOR.planningBg, "P");

      // Signatures
      if (soapY > doc.page.height - 130) {
        doc.addPage();
        doc.rect(0, 0, pageW, 6).fill(COLOR.primary);
        soapY = 50;
      } else {
        soapY += 10;
      }

      const sigY = soapY;
      doc.font("Helvetica").fontSize(8).fillColor(COLOR.textMuted);
      doc.text("Penerima Laporan (Pasien/Keluarga),", 70, sigY, { width: 200, align: "center" });
      doc.text("Praktisi Medis Pemeriksa,", pageW - 270, sigY, { width: 200, align: "center" });

      doc.text("( __________________________ )", 70, sigY + 55, { width: 200, align: "center" });
      doc.text(`( ${data.practitionerName || "__________________________"} )`, pageW - 270, sigY + 55, { width: 200, align: "center" });
    }

    // Footer page loops (Page X of Y)
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      
      doc.moveTo(50, doc.page.height - 40).lineTo(pageW - 50, doc.page.height - 40).strokeColor(COLOR.border).lineWidth(0.5).stroke();
      
      doc.font("Helvetica").fontSize(7).fillColor(COLOR.textMuted);
      if (i === 0) {
        doc.text("Terima kasih atas kerja sama dan kepercayaan Anda.", 50, doc.page.height - 30);
      } else {
        doc.text("Laporan rekam medis rahasia, hanya untuk keperluan medis.", 50, doc.page.height - 30);
      }
      doc.text(`Halaman ${i + 1} dari ${totalPages}`, 50, doc.page.height - 30, { align: "right" });
    }

    doc.end();
  });
}

export function generateSOAPPDF(data: SOAPData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageW = doc.page.width;
    const contentW = pageW - 100; // 50 margin kiri + kanan

    // Top thin accent bar
    doc.rect(0, 0, pageW, 6).fill(COLOR.primary);

    // Header logo & title
    doc.font("Helvetica-Bold").fontSize(18).fillColor(COLOR.primary);
    doc.text(data.practitionerPractice || "NakesPro", 50, 40);
    
    doc.font("Helvetica").fontSize(9).fillColor(COLOR.textMuted);
    doc.text("Laporan Rekam Medis Pasien", 50, 62);

    doc.font("Helvetica-Bold").fontSize(18).fillColor(COLOR.textDark);
    doc.text("LAPORAN TINDAKAN (SOAP)", 50, 40, { align: "right" });
    
    doc.font("Helvetica-Bold").fontSize(10).fillColor(COLOR.textMuted);
    doc.text(`SOAP-${data.invoiceNumber.split("-").slice(1).join("-")}`, 50, 62, { align: "right" });
    
    doc.font("Helvetica").fontSize(9).fillColor(COLOR.textMuted);
    doc.text(`Tanggal Tindakan: ${formatDate(data.actionDate)}`, 50, 76, { align: "right" });

    // Divider line
    doc.moveTo(50, 105).lineTo(pageW - 50, 105).strokeColor(COLOR.border).lineWidth(1).stroke();

    // Info Pasien & Pemeriksa
    const p2InfoY = 120;
    doc.rect(50, p2InfoY, contentW, 60).fill(COLOR.bgLight).stroke(COLOR.border);

    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLOR.textMuted);
    doc.text("NAMA PASIEN", 65, p2InfoY + 12);
    doc.text("PRAKTISI MEDIS", 65 + contentW * 0.4, p2InfoY + 12);
    doc.text("TINDAKAN", 65 + contentW * 0.7, p2InfoY + 12);

    doc.font("Helvetica-Bold").fontSize(10).fillColor(COLOR.textDark);
    doc.text(data.patientName, 65, p2InfoY + 24, { width: contentW * 0.35 - 15 });
    doc.text(data.practitionerName || "Nakes", 65 + contentW * 0.4, p2InfoY + 24, { width: contentW * 0.3 - 15 });
    doc.text(data.actionType, 65 + contentW * 0.7, p2InfoY + 24, { width: contentW * 0.3 - 15 });

    // SOAP content rendering
    let soapY = p2InfoY + 75;

    const renderSOAPP2Box = (title: string, content: string | undefined | null, color: string, bg: string, labelChar: string) => {
      const text = content && content.trim() ? content.trim() : "Tidak ada catatan klinis.";
      
      doc.font("Helvetica-Bold").fontSize(10).fillColor(COLOR.textDark);
      doc.rect(50, soapY, 18, 18).fill(color);
      doc.fillColor(COLOR.white).text(labelChar, 50, soapY + 4, { width: 18, align: "center" });

      doc.fillColor(COLOR.textDark).text(title, 76, soapY + 3);
      soapY += 24;

      doc.font("Helvetica").fontSize(9);
      const textH = doc.heightOfString(text, { width: contentW - 24 });
      const boxH = textH + 16;

      doc.rect(50, soapY, contentW, boxH).fill(bg).stroke(COLOR.border);
      doc.fillColor(COLOR.textDark).text(text, 62, soapY + 8, { width: contentW - 24, lineGap: 1.5 });

      soapY += boxH + 18;
    };

    renderSOAPP2Box("Subjektif (S) - Anamnesis & Keluhan", data.soapSubjective, COLOR.subjective, COLOR.subjectiveBg, "S");
    renderSOAPP2Box("Objektif (O) - Pemeriksaan Fisik & Penunjang", data.soapObjective, COLOR.objective, COLOR.objectiveBg, "O");
    renderSOAPP2Box("Asesmen (A) - Diagnosis & Analisis", data.soapAssessment, COLOR.assessment, COLOR.assessmentBg, "A");
    
    // Auto-wrap page check for Planning (P)
    if (soapY > doc.page.height - 180) {
      doc.addPage();
      doc.rect(0, 0, pageW, 6).fill(COLOR.primary);
      soapY = 50;
    }
    renderSOAPP2Box("Planning (P) - Terapi & Rencana Tindak Lanjut", data.soapPlanning, COLOR.planning, COLOR.planningBg, "P");

    // Signatures
    if (soapY > doc.page.height - 130) {
      doc.addPage();
      doc.rect(0, 0, pageW, 6).fill(COLOR.primary);
      soapY = 50;
    } else {
      soapY += 10;
    }

    const sigY = soapY;
    doc.font("Helvetica").fontSize(8).fillColor(COLOR.textMuted);
    doc.text("Penerima Laporan (Pasien/Keluarga),", 70, sigY, { width: 200, align: "center" });
    doc.text("Praktisi Medis Pemeriksa,", pageW - 270, sigY, { width: 200, align: "center" });

    doc.text("( __________________________ )", 70, sigY + 55, { width: 200, align: "center" });
    doc.text(`( ${data.practitionerName || "__________________________"} )`, pageW - 270, sigY + 55, { width: 200, align: "center" });

    // Footer page loops (Page X of Y)
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      
      doc.moveTo(50, doc.page.height - 40).lineTo(pageW - 50, doc.page.height - 40).strokeColor(COLOR.border).lineWidth(0.5).stroke();
      
      doc.font("Helvetica").fontSize(7).fillColor(COLOR.textMuted);
      doc.text("Laporan rekam medis rahasia, hanya untuk keperluan medis.", 50, doc.page.height - 30);
      doc.text(`Halaman ${i + 1} dari ${totalPages}`, 50, doc.page.height - 30, { align: "right" });
    }

    doc.end();
  });
}
