import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentEmail } from '@/lib/email';
import { PaymentEmailData } from '@/lib/email/types';

export async function POST(req: NextRequest) {
  try {
    const data: PaymentEmailData = await req.json();

    // Validate required fields
    if (!data.clientEmail || !data.clientName || !data.amount || !data.currency || !data.reference || !data.paymentLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await sendPaymentEmail(data);
    
    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in email API route:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
