import { NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { paymentData, qrCodeData } = data;

    if (!paymentData || !qrCodeData) {
      return NextResponse.json(
        { error: 'Missing required data', details: 'Payment data and QR code data are required' },
        { status: 400 }
      );
    }

    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Define colors
    const primaryColor = '#553C9A'; // Purple
    const secondaryColor = '#2D3748'; // Dark gray
    const lightGray = '#718096';
    
    // Generate QR code as data URL with styling
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, {
      width: 150,
      margin: 1,
      color: {
        dark: primaryColor,
        light: '#ffffff',
      },
    });
    
    // Add header with purple background
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Add white text for header with enhanced GastroPay styling
    doc.setTextColor('#ffffff');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(34);
    doc.text('GastroPay', 105, 22, { align: 'center' });
    
    // Reset font for disclaimer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('HAFTUNGSAUSSCHLUSS: Dieses Projekt wurde von Ahmed Amine Bouchmal als Demonstrationsprojekt entwickelt,', 105, 30, { align: 'center' });
    doc.text('um technische Fähigkeiten zu zeigen. Es steht in keiner Verbindung zur GastroPay GmbH oder deren Dienstleistungen.', 105, 35, { align: 'center' });
    
    // Set font for Zahlungsbestätigung
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Zahlungsbestätigung', 105, 50, { align: 'center' });

    let yPos = 65;

    // Add client information section if client data exists
    if (paymentData.client) {
      doc.setTextColor(secondaryColor);
      doc.setFontSize(18);
      doc.text('Kundeninformationen', 20, yPos);

      // Add decorative line under section title
      doc.setDrawColor(primaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, yPos + 3, 190, yPos + 3);

      yPos += 15;
      doc.setFontSize(12);

      // Client details with safe string conversion
      const clientDetails = [
        ['Name', String(paymentData.client.fullName || '')],
        ['Firma', String(paymentData.client.company || 'N/A')],
        ['Email', String(paymentData.client.email || '')],
        ['Telefon', String(paymentData.client.phoneNumber || '')],
        ['Adresse', String(paymentData.client.address || '')],
      ];

      clientDetails.forEach(([label, value]) => {
        doc.setTextColor(secondaryColor);
        doc.text(String(label) + ':', 20, yPos);
        doc.setTextColor(lightGray);
        doc.text(String(value), 60, yPos);
        yPos += 8;
      });

      yPos += 10;
    }

    // Add payment details section
    doc.setTextColor(secondaryColor);
    doc.setFontSize(18);
    doc.text('Zahlungsdetails', 20, yPos);

    // Add decorative line under section title
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 3, 190, yPos + 3);

    yPos += 15;
    doc.setFontSize(12);

    // Payment details rows with safe string conversion
    const rows = [
      ['Betrag', `${Number(paymentData.amount).toFixed(2)} ${String(paymentData.currency)}`, true],
      ['Zahlungsempfänger', String(paymentData.recipientName || 'Nicht angegeben')],
      ['IBAN', String(paymentData.recipientIBAN || 'Nicht angegeben')],
      ['Beschreibung', String(paymentData.description || 'Keine Beschreibung')],
      ['Fälligkeitsdatum', paymentData.dueDate ? new Date(paymentData.dueDate).toLocaleDateString('de-DE') : 'Nicht angegeben'],
      ['Datum', new Date().toLocaleDateString('de-DE')],
      ['Referenz', String(paymentData.reference || 'Nicht verfügbar')],
    ];

    // Add payment details rows with alternating background
    rows.forEach((row, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, yPos - 4, 180, 8, 'F');
      }

      doc.setTextColor(secondaryColor);
      doc.text(String(row[0]), 20, yPos);
      doc.setTextColor(row[2] ? primaryColor : lightGray);
      doc.text(String(row[1]), 100, yPos);
      yPos += 8;
    });

    // Add QR Code section
    yPos += 15;
    doc.setTextColor(secondaryColor);
    doc.setFontSize(14);
    doc.text('QR-Code für Zahlung', 105, yPos, { align: 'center' });

    // Add QR code with border
    yPos += 5;
    const qrSize = 60;
    const qrX = (210 - qrSize) / 2;
    
    // Add white background and border for QR code
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(qrX - 2, yPos - 2, qrSize + 4, qrSize + 4, 'FD');
    
    // Add QR code
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, yPos, qrSize, qrSize);

    // Add system generation text with adjusted position
    yPos += qrSize + 7; 
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.text('Diese Zahlung wurde über das GastroPay System generiert.', 105, yPos, { align: 'center' });

    // Add current date closer to the text
    yPos += 5; 
    const currentDate = new Date().toLocaleDateString('de-DE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(currentDate, 105, yPos, { align: 'center' });

    // Get the PDF as binary data
    const pdfOutput = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfOutput);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="gastropay-zahlung-${paymentData.reference || 'unknown'}.pdf"`,
        'Content-Length': buffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
}
