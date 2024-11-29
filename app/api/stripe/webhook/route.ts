import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { PaymentModel } from '@/lib/models';
import { PaymentStatus } from '@/types';
import dbConnect from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { reference, paymentId } = session.metadata!;

      await dbConnect();

      // Update payment status to PAID
      await PaymentModel.findByIdAndUpdate(paymentId, {
        status: PaymentStatus.PAID,
        stripeSessionId: session.id,
        paidAt: new Date(),
      });

      console.log(`Payment ${reference} marked as paid`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  // Implementation
}

async function handlePaymentIntent(paymentIntent: Stripe.PaymentIntent) {
  // Implementation
}
