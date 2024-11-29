import { Schema } from 'mongoose';
import { Client } from './client';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
}

export interface Payment {
  _id: Schema.Types.ObjectId;
  amount: number;
  currency: string;
  clientId: Schema.Types.ObjectId | Client;
  status: PaymentStatus;
  dueDate: Date;
  reference: string;
  description?: string;
  recipientName?: string;
  recipientIBAN?: string;
  createdAt: Date;
  updatedAt: Date;
}
