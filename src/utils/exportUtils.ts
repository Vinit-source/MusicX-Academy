import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { SwaraStructure } from '../types';

/**
 * Export Swara Structure to Excel (.xlsx) file
 */
export function exportToExcel(swara: SwaraStructure) {
  const wb = XLSX.utils.book_new();

  // Prepare worksheet data matrix
  const sheetData: (string | number)[][] = [];

  // Title & Meta
  sheetData.push([`${swara.ragaName.toUpperCase()} : Parent Raga - ${swara.parentRaga}`]);
  if (swara.remarks) {
    sheetData.push([`Remarks: ${swara.remarks}`]);
  }
  sheetData.push([]); // blank

  // Arohanam
  sheetData.push(['Arohanam :']);
  sheetData.push(swara.arohanam);
  sheetData.push([]);

  // Avarohanam
  sheetData.push(['Avarohanam :']);
  sheetData.push(swara.avarohanam);
  sheetData.push([]);

  // Short Phrases
  sheetData.push(['Short Phrases :']);
  swara.shortPhrases.forEach((row) => {
    sheetData.push([row.cell1, row.cell2, row.cell3, row.cell4]);
  });
  sheetData.push([]);

  // Adi Thala (Two Kalai)
  sheetData.push(['Adi Thala ( Two Kalai ) :']);
  swara.adiThalaRows.forEach((row) => {
    // Header beat markers row
    sheetData.push(row.header);
    // Swara notation row
    sheetData.push(row.phrases);
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths for clean reading
  ws['!cols'] = [
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Swara Structure');

  // Trigger file download
  const safeFileName = swara.ragaName.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `${safeFileName}_Swara_Structure.xlsx`);
}

/**
 * Export Swara Structure to PDF document
 */
export function exportToPdf(swara: SwaraStructure) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Title Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(`${swara.ragaName}`, 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(`Parent Raga - ${swara.parentRaga}`, pageWidth - 14, 18, { align: 'right' });

  let startY = 24;

  if (swara.remarks) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Note: ${swara.remarks}`, 14, startY);
    startY += 8;
  }

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, startY, pageWidth - 14, startY);
  startY += 8;

  // Arohanam & Avarohanam Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);

  autoTable(doc, {
    startY: startY,
    head: [['Arohanam', swara.arohanam.join('   ')]],
    body: [['Avarohanam', swara.avarohanam.join('   ')]],
    theme: 'plain',
    headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' },
    bodyStyles: { textColor: [30, 41, 59], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold', textColor: [71, 85, 105] },
      1: { fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  startY = (doc as any).lastAutoTable.finalY + 8;

  // Short Phrases
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Short Phrases :', 14, startY);
  startY += 4;

  const phraseBody = swara.shortPhrases.map((r) => [r.cell1, r.cell2, r.cell3, r.cell4]);

  autoTable(doc, {
    startY: startY,
    body: phraseBody,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      halign: 'center',
      valign: 'middle',
      textColor: [30, 41, 59],
      lineWidth: 0.2,
      lineColor: [148, 163, 184],
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    margin: { left: 14, right: 14 },
  });

  startY = (doc as any).lastAutoTable.finalY + 8;

  // Adi Thala (Two Kalai)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Adi Thala ( Two Kalai ) :', 14, startY);
  startY += 4;

  const thalaBody: any[] = [];
  swara.adiThalaRows.forEach((row) => {
    // Header row
    thalaBody.push([
      { content: row.header[0], styles: { fontStyle: 'bold', fillColor: [241, 245, 249], halign: 'center' } },
      { content: row.header[1], styles: { fontStyle: 'bold', fillColor: [241, 245, 249], halign: 'center' } },
      { content: row.header[2], styles: { fontStyle: 'bold', fillColor: [241, 245, 249], halign: 'center' } },
      { content: row.header[3], styles: { fontStyle: 'bold', fillColor: [241, 245, 249], halign: 'center' } },
    ]);
    // Notation row
    thalaBody.push([
      { content: row.phrases[0], styles: { font: 'courier', halign: 'center' } },
      { content: row.phrases[1], styles: { font: 'courier', halign: 'center' } },
      { content: row.phrases[2], styles: { font: 'courier', halign: 'center' } },
      { content: row.phrases[3], styles: { font: 'courier', halign: 'center' } },
    ]);
  });

  autoTable(doc, {
    startY: startY,
    body: thalaBody,
    theme: 'grid',
    styles: {
      fontSize: 9.5,
      cellPadding: 2.5,
      lineWidth: 0.3,
      lineColor: [100, 116, 139],
    },
    margin: { left: 14, right: 14 },
  });

  // Footer branding
  const finalY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Digitized with Smart Carnatic Swara OCR', pageWidth / 2, Math.min(finalY, 285), { align: 'center' });

  const safeFileName = swara.ragaName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${safeFileName}_Swara_Structure.pdf`);
}
