import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentEmail } from '@/lib/email';
import { PaymentEmailData } from '@/lib/email/types';

export async function POST(req: NextRequest) {
  try {
    const { isUpdate = false, ...data }: PaymentEmailData & { isUpdate?: boolean } = await req.json();

    console.log('Received email request:', {
      isUpdate,
      clientEmail: data.clientEmail,
      reference: data.reference
    });

    // Validate required fields
    if (!data.clientEmail || !data.clientName || !data.amount || !data.currency || !data.reference || !data.paymentLink) {
      console.error('Missing required fields:', {
        hasClientEmail: !!data.clientEmail,
        hasClientName: !!data.clientName,
        hasAmount: !!data.amount,
        hasCurrency: !!data.currency,
        hasReference: !!data.reference,
        hasPaymentLink: !!data.paymentLink
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await sendPaymentEmail(data, isUpdate);
    console.log('Email sent successfully');
    
    return NextResponse.json(
      { message: isUpdate ? 'Payment update email sent successfully' : 'Payment email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in email API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}
