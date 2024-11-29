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
          .footer { margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
          .disclaimer { margin-top: 20px; font-size: 11px; color: #888; }
          .update-badge {
            background-color: #f6ad55;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
            margin-bottom: 20px;
            display: inline-block;
          }
          .logo { margin-bottom: 20px; }
          .info-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isUpdate ? 'Zahlungsaktualisierung' : 'Zahlungsaufforderung'}</h1>
            ${isUpdate ? '<span class="update-badge">Aktualisierte Zahlungsinformationen</span>' : ''}
          </div>
          
          <p>Sehr geehrte(r) ${data.clientName},</p>
          
          <p>${isUpdate 
            ? 'Ihre Zahlungsaufforderung wurde mit den folgenden Details aktualisiert:' 
            : 'Eine neue Zahlungsaufforderung wurde für Sie mit den folgenden Details erstellt:'}</p>
          
          <div class="info-box">
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li><strong>Betrag:</strong> <span class="amount">${formattedAmount}</span></li>
              <li><strong>Referenz:</strong> ${data.reference}</li>
              ${data.description ? `<li><strong>Beschreibung:</strong> ${data.description}</li>` : ''}
              ${formattedDueDate ? `<li><strong>Fälligkeitsdatum:</strong> ${formattedDueDate}</li>` : ''}
            </ul>
          </div>
          
          <p>Um Ihre Zahlung abzuschließen, klicken Sie bitte auf den folgenden Button:</p>
          
          <a href="${data.paymentLink}" class="button">Jetzt bezahlen</a>
          
          <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
          <p style="word-break: break-all;">${data.paymentLink}</p>
          
          <div class="footer">
            ${isUpdate 
              ? '<p>Dies ist eine Aktualisierung Ihrer vorherigen Zahlungsaufforderung. Der neue Zahlungslink ersetzt alle vorherigen Links.</p>' 
              : ''}
            <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
            <p>Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht direkt auf diese Nachricht.</p>
            
            <div class="disclaimer">
              <p><strong>Rechtlicher Hinweis:</strong></p>
              <p>Diese E-Mail und alle Anhänge sind vertraulich und ausschließlich für den/die genannten Empfänger bestimmt. Wenn Sie nicht der vorgesehene Empfänger sind, informieren Sie bitte den Absender und löschen Sie diese E-Mail. Jede unbefugte Weitergabe oder Kopie dieser E-Mail ist untersagt.</p>
              <p>Die Sicherheit der Datenübertragung per E-Mail kann nicht garantiert werden. Die in dieser E-Mail enthaltenen Informationen können daher Irrtümer oder Fehler enthalten. Eine Haftung, die sich aus der Nutzung dieser Informationen ergibt, wird ausgeschlossen.</p>
              <p>Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer, sofern nicht anders angegeben.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
${isUpdate ? 'Zahlungsaktualisierung' : 'Zahlungsaufforderung'}
${isUpdate ? '[Aktualisierte Zahlungsinformationen]' : ''}

Sehr geehrte(r) ${data.clientName},

${isUpdate 
  ? 'Ihre Zahlungsaufforderung wurde mit den folgenden Details aktualisiert:' 
  : 'Eine neue Zahlungsaufforderung wurde für Sie mit den folgenden Details erstellt:'}

Betrag: ${formattedAmount}
Referenz: ${data.reference}
${data.description ? `Beschreibung: ${data.description}` : ''}
${formattedDueDate ? `Fälligkeitsdatum: ${formattedDueDate}` : ''}

Um Ihre Zahlung abzuschließen, besuchen Sie bitte:
${data.paymentLink}

${isUpdate 
  ? 'Dies ist eine Aktualisierung Ihrer vorherigen Zahlungsaufforderung. Der neue Zahlungslink ersetzt alle vorherigen Links.'
  : ''}

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht direkt auf diese Nachricht.

Rechtlicher Hinweis:
Diese E-Mail und alle Anhänge sind vertraulich und ausschließlich für den/die genannten Empfänger bestimmt. Wenn Sie nicht der vorgesehene Empfänger sind, informieren Sie bitte den Absender und löschen Sie diese E-Mail. Jede unbefugte Weitergabe oder Kopie dieser E-Mail ist untersagt.

Die Sicherheit der Datenübertragung per E-Mail kann nicht garantiert werden. Die in dieser E-Mail enthaltenen Informationen können daher Irrtümer oder Fehler enthalten. Eine Haftung, die sich aus der Nutzung dieser Informationen ergibt, wird ausgeschlossen.

Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer, sofern nicht anders angegeben.
  `;

  return {
    subject: isUpdate ? 'Zahlungsaktualisierung' : 'Neue Zahlungsaufforderung',
    html,
    text,
  };
};
