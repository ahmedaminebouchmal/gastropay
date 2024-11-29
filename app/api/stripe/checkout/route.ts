import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PaymentModel } from '@/lib/models';
import dbConnect from '@/lib/db';
import { Client } from '@/types';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

// Initialize Stripe with test key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as any,
  typescript: true,
});

export async function POST(request: Request) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    // Find payment in database
    await dbConnect();
    const payment = await PaymentModel.findOne({ reference }).populate('clientId');

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Get client email from populated clientId
    const clientEmail = (payment.clientId as Client)?.email;

    // Calculate expiration time (23 hours from now to be safe)
    const expiresAt = Math.floor(Date.now() / 1000) + (23 * 60 * 60);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: payment.currency.toLowerCase(),
            product_data: {
              name: `Payment ${payment.reference}`,
              description: payment.description || `Payment reference: ${payment.reference}`,
            },
            unit_amount: Math.round(payment.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments?status=success&reference=${payment.reference}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments?status=cancelled&reference=${payment.reference}`,
      customer_email: clientEmail,
      metadata: {
        reference: payment.reference,
        paymentId: payment._id.toString(),
      },
      expires_at: expiresAt, // Set to 23 hours from now
      submit_type: 'pay',
      billing_address_collection: 'auto',
    }) as Stripe.Checkout.Session;

    if (!session?.url) {
      throw new Error('Failed to generate Stripe checkout URL');
    }

    // Return the direct Stripe checkout URL
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
    // Return a more detailed error response
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error.message,
        type: error.type
      },
      { status: 500 }
    );
  }
}
