import mongoose, { Schema } from 'mongoose';
import { Payment, PaymentStatus } from '@/types/payment';
import { Client } from '@/types/client';

const paymentSchema = new Schema<Payment>(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      validate: {
        validator: function(v: number) {
          return v > 0;
        },
        message: 'Amount must be greater than 0'
      }
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
      validate: {
        validator: function(v: Date) {
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          return v >= now;
        },
        message: 'Due date must be in the future'
      }
    },
    reference: {
      type: String,
      required: [true, 'Reference is required'],
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
paymentSchema.index({ clientId: 1 });
paymentSchema.index({ reference: 1 }, { unique: true });
paymentSchema.index({ status: 1 });
paymentSchema.index({ dueDate: 1 });

// Add a pre-save hook to ensure dueDate is in the future
paymentSchema.pre('save', function(next) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  if (this.dueDate < now) {
    next(new Error('Due date must be in the future'));
  } else {
    next();
  }
});

// Export the model
const PaymentModel = mongoose.models.Payment || mongoose.model<Payment>('Payment', paymentSchema);
export default PaymentModel;
