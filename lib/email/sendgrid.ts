import sgMail from '@sendgrid/mail';
import { PaymentEmailData, EmailTemplate } from './types';
import { generatePaymentTemplate } from './templates';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not defined in environment variables');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendPaymentEmail = async (data: PaymentEmailData) => {
  const template = generatePaymentTemplate(data);

  const msg = {
    to: data.clientEmail,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@gastropay.com', // Update this with your verified sender
    subject: template.subject,
    text: template.text,
    html: template.html,
    attachments: data.attachments,
  };

  try {
    const response = await sgMail.send(msg);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
