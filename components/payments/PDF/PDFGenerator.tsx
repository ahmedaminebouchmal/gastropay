import PDFDocument from 'pdfkit';
import blobStream from 'blob-stream';
import { QRCodeSVG } from 'qrcode.react';

interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  reference: string;
}

interface PDFGeneratorProps {
  paymentData: PaymentData;
  qrCodeData: string;
}

export async function generatePDF({ paymentData, qrCodeData }: PDFGeneratorProps) {
  // Create a new PDFDocument
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: 'Gastropay Zahlung',
      Author: 'Gastropay System',
    },
  });

  // Create a stream to save the PDF
  const stream = doc.pipe(blobStream());

  // Add the Gastropay header
  doc
    .fontSize(24)
    .fillColor('#553C9A')
    .text('Gastropay Zahlung', { align: 'center' })
    .moveDown(2);

  // Add payment details section
  doc
    .fontSize(16)
    .fillColor('#2D3748')
    .text('Zahlungsdetails')
    .moveDown(1);

  // Create a table-like structure for payment details
  const details = [
    ['Betrag:', `${paymentData.amount} ${paymentData.currency}`],
    ['Beschreibung:', paymentData.description],
    ['Referenz:', paymentData.reference],
    ['Datum:', new Date().toLocaleDateString('de-DE')],
  ];

  details.forEach(([label, value]) => {
    doc
      .fontSize(12)
      .fillColor('#4A5568')
      .text(label, { continued: true, width: 150 })
      .fillColor('#2D3748')
      .text(value)
      .moveDown(0.5);
  });

  // Add QR code section
  doc.moveDown(2);
  doc
    .fontSize(14)
    .fillColor('#2D3748')
    .text('QR-Code für Zahlung', { align: 'center' })
    .moveDown(1);

  // Generate QR code as SVG and convert to data URL
  const qrCodeSvg = document.createElement('div');
  qrCodeSvg.style.display = 'none';
  document.body.appendChild(qrCodeSvg);

  try {
    // Create QR code
    const qrElement = <QRCodeSVG value={qrCodeData} size={200} />;
    // Note: In a real implementation, you'd want to use a server-side QR code generator
    // or find a way to generate the QR code that works with PDFKit directly

    // For now, we'll add a placeholder for the QR code
    doc
      .rect(doc.page.width / 2 - 100, doc.y, 200, 200)
      .stroke()
      .text('QR Code Here', doc.page.width / 2, doc.y + 90, { align: 'center' });
  } finally {
    document.body.removeChild(qrCodeSvg);
  }

  // Add footer
  doc
    .moveDown(4)
    .fontSize(10)
    .fillColor('#718096')
    .text('Scannen Sie den QR-Code mit Ihrer Banking-App, um die Zahlung durchzuführen.', {
      align: 'center',
    })
    .moveDown(1)
    .text(`Generiert von Gastropay - ${new Date().toLocaleString('de-DE')}`, {
      align: 'center',
    });

  // Add terms and conditions
  doc
    .moveDown(2)
    .fontSize(8)
    .fillColor('#A0AEC0')
    .text(
      'Diese Zahlungsaufforderung ist 24 Stunden gültig. Für Fragen wenden Sie sich bitte an unseren Support.',
      { align: 'center' }
    );

  // Finalize the PDF
  doc.end();

  // Get the blob from the stream
  const blob = await new Promise<Blob>((resolve) => {
    stream.on('finish', () => {
      resolve(stream.toBlob('application/pdf'));
    });
  });

  // Create a URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `Gastropay_Zahlung_${paymentData.reference || 'QR'}.pdf`;
  link.click();

  // Clean up
  URL.revokeObjectURL(url);
}

// Helper function to format currency
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
