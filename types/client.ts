import { Schema } from 'mongoose';

export interface Client {
  _id: Schema.Types.ObjectId;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}
