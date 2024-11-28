import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Readable } from 'stream';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { paymentData, qrCodeData } = data;

    // Create a new PDFDocument
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: 'Gastropay Zahlung',
        Author: 'Gastropay System',
      },
    });

    // Create buffers to store the PDF data
    const chunks: Buffer[] = [];
    doc.on('data', chunks.push.bind(chunks));

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

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

    // Add QR code
    doc.moveDown(2);
    doc
      .fontSize(14)
      .fillColor('#2D3748')
      .text('QR-Code für Zahlung', { align: 'center' })
      .moveDown(1);

    // Add the QR code image
    doc.image(qrCodeDataUrl, {
      fit: [200, 200],
      align: 'center',
    });

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

    // Wait for the PDF to be generated
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Gastropay_Zahlung_${
          paymentData.reference || 'QR'
        }.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
