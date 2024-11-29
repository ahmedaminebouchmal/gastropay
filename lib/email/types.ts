import { ObjectId } from 'mongoose';

export interface EmailAttachment {
  content: string;
  filename: string;
  type: string;
  disposition: string;
}

export interface PaymentEmailData {
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  reference: string;
  description?: string;
  paymentLink: string;
  dueDate?: Date;
  attachments?: EmailAttachment[];
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}
