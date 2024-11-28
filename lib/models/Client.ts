import mongoose, { Schema } from 'mongoose';
import { Client } from '@/types/client';

const clientSchema = new Schema<Client>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function(v: string) {
          return /^\+?[0-9\s-()]{8,}$/.test(v);
        },
        message: 'Invalid phone number format'
      }
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      minlength: [5, 'Address must be at least 5 characters'],
    },
    company: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
clientSchema.index({ email: 1 }, { unique: true });
clientSchema.index({ phoneNumber: 1 });

// Check if the model exists before trying to create it
const ClientModel = (mongoose.models.Client as mongoose.Model<Client>) || 
  mongoose.model<Client>('Client', clientSchema);

export default ClientModel;
