import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { PaymentModel } from '@/lib/models';
import type { Payment as PaymentType } from '@/types';

// Get all payments or a specific payment
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('Attempting to connect to MongoDB...');
    await dbConnect();
    console.log('Successfully connected to MongoDB');

    if (id) {
      // Get specific payment
      const payment = await PaymentModel.findById(id).populate('clientId');
      if (!payment) {
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(payment);
    }

    // Get all payments
    const payments = await PaymentModel.find({})
      .populate('clientId')
      .sort({ createdAt: -1 });
    console.log(`Found ${payments.length} payments`);
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error in GET /api/payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// Create new payment
export async function POST(request: Request): Promise<NextResponse> {
  try {
    console.log('POST /api/payments - Starting payment creation process');

    console.log('Attempting to connect to MongoDB...');
    await dbConnect();
    console.log('Successfully connected to MongoDB');

    const data = await request.json();
    console.log('Received payment data:', data);

    // Validate required fields
    const requiredFields = ['amount', 'currency', 'clientId', 'dueDate', 'reference'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create payment
    console.log('Creating payment with data:', {
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

    const payment = await PaymentModel.create({
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

    // Populate client information
    const populatedPayment = await payment.populate('clientId');

    console.log('Successfully created payment:', populatedPayment);
    return NextResponse.json(populatedPayment, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/payments:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Payment reference already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment', details: error.message },
      { status: 500 }
    );
  }
}

// Update payment
export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to connect to MongoDB...');
    await dbConnect();
    console.log('Successfully connected to MongoDB');

    const data = await request.json();
    console.log('Received update data:', data);

    // Validate required fields
    if (!data.amount || !data.currency || !data.clientId || !data.dueDate || !data.reference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedPayment = await PaymentModel.findByIdAndUpdate(
      id,
      {
        amount: data.amount,
        currency: data.currency,
        clientId: data.clientId,
        status: data.status,
        dueDate: data.dueDate,
        reference: data.reference,
        description: data.description,
        recipientName: data.recipientName,
        recipientIBAN: data.recipientIBAN,
      },
      { new: true, runValidators: true }
    ).populate('clientId');

    if (!updatedPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('Error in PUT /api/payments:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Payment reference already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

// Delete payment
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to connect to MongoDB...');
    await dbConnect();
    console.log('Successfully connected to MongoDB');

    const payment = await PaymentModel.findByIdAndDelete(id);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/payments:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
