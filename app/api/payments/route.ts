import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Payment from '@/lib/models/Payment';

export async function GET() {
  try {
    await connectToDatabase();
    const payments = await Payment.find().sort({ createdAt: -1 });
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    const payment = await Payment.create(body);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
