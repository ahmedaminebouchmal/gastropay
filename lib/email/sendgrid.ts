import sgMail from '@sendgrid/mail';
import { PaymentEmailData, EmailTemplate } from './types';
import { generatePaymentTemplate } from './templates';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not defined in environment variables');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendPaymentEmail = async (data: PaymentEmailData, isUpdate: boolean = false) => {
  console.log('Generating email template:', {
    isUpdate,
    clientEmail: data.clientEmail,
    reference: data.reference
  });

  const template = generatePaymentTemplate(data, isUpdate);

  const msg = {
    to: data.clientEmail,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@gastropay.com',
    subject: template.subject,
    text: template.text,
    html: template.html,
    attachments: data.attachments,
  };

  try {
    console.log('Sending email via SendGrid:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject,
      hasAttachments: !!msg.attachments?.length
    });

    const response = await sgMail.send(msg);
    console.log('SendGrid response:', response[0].statusCode);
    return response;
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
    throw error;
  }
};
