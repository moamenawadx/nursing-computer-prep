import { jsPDF } from "jspdf";
import type { CertificatePDFData } from "@/types";

const INSTITUTION_NAME = "مدارس التمريض — دليل الاستعداد لاختبار الحاسب الآلي";

export function generateCertificatePDF(data: CertificatePDFData): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const institution = data.institutionName ?? INSTITUTION_NAME;

  // Border
  doc.setDrawColor(180, 130, 40);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  doc.setLineWidth(0.5);
  doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(120, 80, 20);
  doc.text("Certificate of Completion", pageWidth / 2, 40, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(institution, pageWidth / 2, 52, { align: "center" });

  // Body
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text("This certificate is proudly presented to", pageWidth / 2, 75, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(30, 30, 30);
  doc.text(data.studentName, pageWidth / 2, 92, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text("for successfully completing the lesson", pageWidth / 2, 108, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text(data.lessonTitle, pageWidth / 2, 120, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(`with a score of ${data.score}%`, pageWidth / 2, 132, { align: "center" });

  // Details row
  const detailsY = 155;
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);

  doc.text(`Certificate No: ${data.certificateNumber}`, 30, detailsY);
  doc.text(`Issue Date: ${data.issueDate}`, pageWidth - 30, detailsY, { align: "right" });

  // Signature placeholder
  doc.setDrawColor(150, 150, 150);
  doc.line(pageWidth / 2 - 40, pageHeight - 45, pageWidth / 2 + 40, pageHeight - 45);
  doc.setFontSize(10);
  doc.text("Authorized Signature", pageWidth / 2, pageHeight - 38, { align: "center" });

  doc.save(`certificate-${data.certificateNumber}.pdf`);
}
