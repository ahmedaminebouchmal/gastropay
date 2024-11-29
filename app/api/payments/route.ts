import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { PaymentModel } from '@/lib/models';
import type { Payment as PaymentType } from '@/types';

// Get all payments or a specific payment
export async function GET(request: globalThis.Request): Promise<NextResponse> {
  try {
    console.log('----------------------------------------');
    console.log('GET /api/payments - Starting fetch process');
    console.log('Request URL:', request.url);

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    console.log('Query parameters:', {
      id: id || 'not provided'
    });

    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('MongoDB connection successful');

    let payment;
    if (id) {
      console.log(`Fetching specific payment with ID: ${id}`);
      payment = await PaymentModel.findById(id).populate({
        path: 'clientId',
        select: '_id email fullName name company address'
      });
      
      if (!payment) {
        console.error(`Payment with ID ${id} not found`);
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }
      console.log('Successfully fetched payment:', {
        id: payment._id,
        amount: payment.amount,
        status: payment.status
      });
    } else {
      console.log('Fetching all payments...');
      payment = await PaymentModel.find()
        .populate({
          path: 'clientId',
          select: '_id email fullName name company address'
        })
        .sort({ createdAt: -1 });
      console.log(`Successfully fetched ${payment.length} payments`);
    }

    console.log('----------------------------------------');
    return NextResponse.json(payment);
  } catch (error) {
    console.error('----------------------------------------');
    console.error('Error in GET /api/payments:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    console.error('----------------------------------------');
    return NextResponse.json(
      { error: 'Failed to fetch payments', details: error.message },
      { status: 500 }
    );
  }
}

// Create new payment
export async function POST(request: globalThis.Request): Promise<NextResponse> {
  try {
    console.log('----------------------------------------');
    console.log('POST /api/payments - Starting payment creation process');
    console.log('Request URL:', request.url);

    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('MongoDB connection successful');

    const data = await request.json();
    console.log('Received payment data:', {
      amount: data.amount,
      currency: data.currency,
      clientId: data.clientId,
      status: data.status,
      dueDate: data.dueDate,
      reference: data.reference,
      description: data.description,
      recipientName: data.recipientName,
      recipientIBAN: data.recipientIBAN,
    });

    // Validate required fields
    const requiredFields = ['amount', 'currency', 'clientId', 'dueDate', 'reference'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.error('Validation failed - Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    console.log('All required fields present');

    console.log('Creating new payment in database...');
    const payment = await PaymentModel.create(data);
    const populatedPayment = await payment.populate({
      path: 'clientId',
      select: '_id email fullName name company address'
    });

    console.log('Payment successfully created:', {
      id: populatedPayment._id,
      amount: populatedPayment.amount,
      currency: populatedPayment.currency,
      status: populatedPayment.status,
      clientId: populatedPayment.clientId,
      dueDate: populatedPayment.dueDate,
      reference: populatedPayment.reference,
      description: populatedPayment.description,
      recipientName: populatedPayment.recipientName,
      recipientIBAN: populatedPayment.recipientIBAN,
    });
    console.log('----------------------------------------');

    return NextResponse.json(populatedPayment, { status: 201 });
  } catch (error) {
    console.error('----------------------------------------');
    console.error('Error in POST /api/payments:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    console.error('----------------------------------------');
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A payment with this reference already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment', details: error.message },
      { status: 500 }
    );
  }
}
