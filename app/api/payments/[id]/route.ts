import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { PaymentModel } from '@/lib/models';

// Update payment
export async function PUT(
  request: globalThis.Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = params.id;
    console.log('----------------------------------------');
    console.log(`PUT /api/payments/${id} - Starting payment update process`);
    console.log('Request URL:', request.url);
    console.log('Payment ID from params:', id);

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
      description: data.description,
      recipientName: data.recipientName,
    });

    // Validate required fields
    const requiredFields = ['amount', 'currency', 'clientId', 'dueDate'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.error('Validation failed - Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    console.log('All required fields present');

    console.log('Attempting to update payment in database...');
    // Find and update the payment
    const updatedPayment = await PaymentModel.findByIdAndUpdate(
      id,
      { 
        amount: data.amount,
        currency: data.currency,
        clientId: data.clientId,
        status: data.status,
        dueDate: data.dueDate,
        description: data.description,
        recipientName: data.recipientName,
        recipientIBAN: data.recipientIBAN,
      },
      { new: true, runValidators: true }
    ).populate({
      path: 'clientId',
      select: '_id email fullName name company address'
    });

    if (!updatedPayment) {
      console.error(`Payment with ID ${id} not found`);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    console.log('Payment successfully updated:', {
      id: updatedPayment._id,
      amount: updatedPayment.amount,
      currency: updatedPayment.currency,
      status: updatedPayment.status,
      clientId: updatedPayment.clientId,
      description: updatedPayment.description,
      recipientName: updatedPayment.recipientName,
    });
    console.log('----------------------------------------');

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('----------------------------------------');
    console.error('Error in PUT /api/payments:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    console.error('----------------------------------------');
    return NextResponse.json(
      { error: 'Failed to update payment', details: error.message },
      { status: 500 }
    );
  }
}

// Delete payment
export async function DELETE(
  request: globalThis.Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = params.id;
    console.log('----------------------------------------');
    console.log(`DELETE /api/payments/${id} - Starting payment deletion process`);
    console.log('Request URL:', request.url);
    console.log('Payment ID from params:', id);

    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('MongoDB connection successful');

    console.log('Attempting to delete payment...');
    const payment = await PaymentModel.findByIdAndDelete(id).populate('clientId', '_id name email');

    if (!payment) {
      console.error(`Payment with ID ${id} not found`);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    console.log('Payment successfully deleted:', {
      id: payment._id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      description: payment.description,
      recipientName: payment.recipientName,
    });
    console.log('----------------------------------------');

    return NextResponse.json({ 
      message: 'Payment deleted successfully',
      deletedPayment: {
        id: payment._id,
        reference: payment.reference
      }
    });
  } catch (error) {
    console.error('----------------------------------------');
    console.error('Error in DELETE /api/payments:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    console.error('----------------------------------------');
    return NextResponse.json(
      { error: 'Failed to delete payment', details: error.message },
      { status: 500 }
    );
  }
}
