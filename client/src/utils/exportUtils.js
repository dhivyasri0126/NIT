import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Export arbitrary table data as CSV
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate and download a PDF report
export const exportReportToPDF = ({ title, subtitle, columns, rows, filename = 'report.pdf' }) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(23, 23, 47);
  doc.text('Sri Murukku Foods', 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Food Manufacturing & Distribution ERP - Trichy, Tamil Nadu', 14, 24);
  doc.text(`GSTIN: 33ABCDE1234F1Z5 | Date: ${new Date().toLocaleDateString()}`, 14, 29);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 33, 196, 33);

  // Report Title
  doc.setFontSize(14);
  doc.setTextColor(109, 74, 255);
  doc.text(title, 14, 42);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, 48);
  }

  // Table
  doc.autoTable({
    startY: subtitle ? 52 : 46,
    head: [columns],
    body: rows,
    headStyles: {
      fillColor: [109, 74, 255],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount} - Generated from Sri Murukku Foods ERP`, 14, 288);
  }

  doc.save(filename);
};
