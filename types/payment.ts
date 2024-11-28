import { Schema } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
}

export interface Payment {
  _id: Schema.Types.ObjectId;
  amount: number;
  clientId: Schema.Types.ObjectId;
  status: PaymentStatus;
  dueDate: Date;
  reference: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
