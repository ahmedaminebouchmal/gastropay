import { PaymentEmailData, EmailTemplate } from './types';

export const generatePaymentTemplate = (data: PaymentEmailData, isUpdate: boolean = false): EmailTemplate => {
  const formattedAmount = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: data.currency,
  }).format(data.amount);

  // Format due date if it exists
  const formattedDueDate = data.dueDate ? new Date(data.dueDate).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }) : null;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .amount { font-size: 24px; font-weight: bold; color: #2b6cb0; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #2b6cb0; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 20px 0;
          }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
          .update-badge {
            background-color: #f6ad55;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
            margin-bottom: 20px;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isUpdate ? 'Payment Update' : 'Payment Request'}</h1>
            ${isUpdate ? '<span class="update-badge">Updated Payment Information</span>' : ''}
          </div>
          
          <p>Dear ${data.clientName},</p>
          
          <p>${isUpdate 
            ? 'Your payment request has been updated with the following details:' 
            : 'A new payment request has been created for you with the following details:'}</p>
          
          <ul>
            <li><strong>Amount:</strong> <span class="amount">${formattedAmount}</span></li>
            <li><strong>Reference:</strong> ${data.reference}</li>
            ${data.description ? `<li><strong>Description:</strong> ${data.description}</li>` : ''}
            ${formattedDueDate ? `<li><strong>Due Date:</strong> ${formattedDueDate}</li>` : ''}
          </ul>
          
          <p>To complete your payment, please click the button below:</p>
          
          <a href="${data.paymentLink}" class="button">Pay Now</a>
          
          <p>Or copy and paste this link into your browser:</p>
          <p>${data.paymentLink}</p>
          
          <div class="footer">
            ${isUpdate 
              ? '<p>This is an update to your previous payment request. The new payment link above replaces any previous links.</p>' 
              : ''}
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>This is an automated message, please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
${isUpdate ? 'Payment Update' : 'Payment Request'}
${isUpdate ? '[Updated Payment Information]' : ''}

Dear ${data.clientName},

${isUpdate 
  ? 'Your payment request has been updated with the following details:' 
  : 'A new payment request has been created for you with the following details:'}

Amount: ${formattedAmount}
Reference: ${data.reference}
${data.description ? `Description: ${data.description}` : ''}
${formattedDueDate ? `Due Date: ${formattedDueDate}` : ''}

To complete your payment, please visit:
${data.paymentLink}

${isUpdate ? 'This is an update to your previous payment request. The new payment link above replaces any previous links.' : ''}

If you have any questions, please don't hesitate to contact us.

This is an automated message, please do not reply directly to this email.
  `;

  return {
    subject: isUpdate ? `Payment Update - ${data.reference}` : `Payment Request - ${data.reference}`,
    html,
    text,
  };
};
