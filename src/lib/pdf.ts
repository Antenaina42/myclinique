import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { formatCurrency, formatDate } from './formatters';

export interface PrescriptionPDFData {
  prescriptionNumber: string;
  date: string | Date;
  clinic: {
    name: string;
    address: string;
    phone: string;
    email: string;
    currency: string;
  };
  doctor: {
    name: string;
    specialty: string;
    licenseNumber: string;
  };
  patient: {
    name: string;
    age: number;
    gender: string;
    patientNumber: string;
  };
  items: Array<{
    medicineName: string;
    dosage: string;
    form: string;
    quantity: number;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  notes?: string;
}

export async function generatePrescriptionPDF(data: PrescriptionPDFData): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // En-tête Clinique (Couleurs Médicales)
  doc.setFillColor(22, 119, 255); // #1677FF
  doc.rect(0, 0, 210, 8, 'F');

  // Nom de la clinique
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 76, 129); // #0F4C81
  doc.text(data.clinic.name.toUpperCase(), 20, 24);

  // Slogan & Coordonnées
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Centre Médical Hospitalier & Urgences', 20, 30);
  doc.text(`${data.clinic.address} | Tél: ${data.clinic.phone}`, 20, 35);
  doc.text(`Email: ${data.clinic.email}`, 20, 40);

  // Ligne de séparation
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);

  // Bloc Médecin (Gauche)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`Dr. ${data.doctor.name}`, 20, 55);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Spécialité : ${data.doctor.specialty}`, 20, 61);
  doc.text(`N° d'Ordre : ${data.doctor.licenseNumber}`, 20, 67);

  // Bloc Patient & Ordonnance (Droite)
  doc.setFillColor(245, 248, 252);
  doc.roundedRect(120, 50, 70, 28, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 76, 129);
  doc.text(`ORDONNANCE MÉDICALE`, 125, 57);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`N° : ${data.prescriptionNumber}`, 125, 63);
  doc.text(`Date : ${formatDate(data.date)}`, 125, 68);
  doc.text(`Patient : ${data.patient.name} (${data.patient.age} ans)`, 125, 73);

  // Titre Médicaments Prescrits
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 76, 129);
  doc.text('MÉDICAMENTS & POSOLOGIE', 20, 88);

  // Tableau des médicaments
  const tableRows = data.items.map((item, index) => [
    (index + 1).toString(),
    `${item.medicineName} ${item.dosage}\nForme: ${item.form}`,
    item.quantity.toString(),
    `${item.frequency}\n${item.duration}`,
    item.instructions || 'Selon avis médical',
  ]);

  autoTable(doc, {
    startY: 92,
    head: [['#', 'Médicament & Forme', 'Qté', 'Posologie & Durée', 'Instructions spécifiques']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [22, 119, 255],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 45 },
      4: { cellWidth: 45 },
    },
    margin: { left: 20, right: 20 },
  });

  // Position après le tableau
  const lastTableY = (doc as any).lastAutoTable?.finalY || 150;

  // Notes du médecin si présentes
  let currentY = lastTableY + 12;
  if (data.notes) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Observations : ${data.notes}`, 20, currentY);
    currentY += 10;
  }

  // QR Code pour authenticité
  try {
    const qrDataUrl = await QRCode.toDataURL(
      `MYCLINIQUE-VERIF:${data.prescriptionNumber}|${data.patient.patientNumber}|${data.doctor.licenseNumber}`
    );
    doc.addImage(qrDataUrl, 'PNG', 20, currentY, 24, 24);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Code de sécurité unique', 20, currentY + 28);
    doc.text('Authenticité certifiée My Clinique', 20, currentY + 31);
  } catch (e) {
    console.error('QR code generation failed:', e);
  }

  // Cachet & Signature Médecin (Droite)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Cachet et Signature du Médecin :', 125, currentY + 4);

  // Boîte pour cachet
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([2, 2], 0);
  doc.roundedRect(125, currentY + 8, 65, 26, 2, 2, 'S');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Signature & Tampon Officiel', 133, currentY + 22);
  doc.setLineDashPattern([], 0); // reset dash

  // Bas de page légal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Document médical confidentiel généré par le système My Clinique — Validité 30 jours à compter de la date de délivrance.', 20, 285);

  return doc;
}

export interface InvoicePDFData {
  invoiceNumber: string;
  issuedDate: string | Date;
  status: string;
  clinic: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
    currency: string;
  };
  patient: {
    name: string;
    patientNumber: string;
    phone: string;
    address?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  paidAmount: number;
  balance: number;
}

export function generateInvoicePDF(data: InvoicePDFData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Top banner
  doc.setFillColor(15, 76, 129); // #0F4C81
  doc.rect(0, 0, 210, 8, 'F');

  // En-tête
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 76, 129);
  doc.text(data.clinic.name.toUpperCase(), 20, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`${data.clinic.address} | Tél: ${data.clinic.phone}`, 20, 30);
  doc.text(`Email: ${data.clinic.email} | ${data.clinic.taxId}`, 20, 35);

  // Badge Facture
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(22, 119, 255);
  doc.text('FACTURE CLINIQUE', 135, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`N° Facture : ${data.invoiceNumber}`, 135, 30);
  doc.text(`Date : ${formatDate(data.issuedDate)}`, 135, 35);
  doc.text(`Statut : ${data.status === 'PAID' ? 'PAYÉE' : data.status === 'PARTIALLY_PAID' ? 'PARTIELLE' : 'IMPAYÉE'}`, 135, 40);

  // Ligne de séparation
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 46, 190, 46);

  // Facturé à :
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 76, 129);
  doc.text('FACTURÉ À :', 20, 55);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(data.patient.name, 20, 61);
  doc.text(`ID Patient : ${data.patient.patientNumber}`, 20, 66);
  doc.text(`Tél : ${data.patient.phone}`, 20, 71);

  // Tableau
  const tableRows = data.items.map((it, idx) => [
    (idx + 1).toString(),
    it.description,
    it.quantity.toString(),
    formatCurrency(it.unitPrice, data.clinic.currency),
    formatCurrency(it.totalPrice, data.clinic.currency),
  ]);

  autoTable(doc, {
    startY: 78,
    head: [['#', 'Description de la prestation / produit', 'Qté', 'Prix Unitaire', 'Total']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 76, 129],
      textColor: [255, 255, 255],
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 130;

  // Récapitulatif montants à droite
  const rightColX = 120;
  let summaryY = finalY + 10;

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Sous-total :', rightColX, summaryY);
  doc.text(formatCurrency(data.totalAmount, data.clinic.currency), 190, summaryY, { align: 'right' });

  if (data.discountAmount > 0) {
    summaryY += 6;
    doc.text('Remise accordée :', rightColX, summaryY);
    doc.text(`- ${formatCurrency(data.discountAmount, data.clinic.currency)}`, 190, summaryY, { align: 'right' });
  }

  summaryY += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 76, 129);
  doc.text('Montant Total TTC :', rightColX, summaryY);
  doc.text(formatCurrency(data.totalAmount - data.discountAmount + data.taxAmount, data.clinic.currency), 190, summaryY, { align: 'right' });

  summaryY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(16, 185, 129);
  doc.text('Montant Réglé :', rightColX, summaryY);
  doc.text(formatCurrency(data.paidAmount, data.clinic.currency), 190, summaryY, { align: 'right' });

  summaryY += 7;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(data.balance > 0 ? 239 : 71, data.balance > 0 ? 68 : 85, data.balance > 0 ? 68 : 105);
  doc.text('Solde restant dû :', rightColX, summaryY);
  doc.text(formatCurrency(data.balance, data.clinic.currency), 190, summaryY, { align: 'right' });

  // Bas de page
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Merci pour votre confiance. Prestations de santé exonérées de TVA conformément aux réglementations sanitaires.', 20, 285);

  return doc;
}
