import { Schema, model, models, Model } from 'mongoose';
import { Payment as PaymentType, PaymentStatus } from '@/types';

const paymentSchema = new Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'EUR'
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client reference is required'],
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
    required: true,
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  reference: {
    type: String,
    required: [true, 'Reference is required'],
    unique: true,
  },
  description: {
    type: String,
  },
  recipientName: {
    type: String,
  },
  recipientIBAN: {
    type: String,
  }
}, {
  timestamps: true,
});

const Payment: Model<PaymentType> = models.Payment || model<PaymentType>('Payment', paymentSchema);

export default Payment;
