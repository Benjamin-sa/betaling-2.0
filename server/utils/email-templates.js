// server/utils/email-templates.js
const { OrderFields, OrderItemFields } = require("../models/webstore.model");

/**
 * Email template utility functions for generating email content
 */
class EmailTemplates {
  /**
   * Generate multipart email content for order confirmation
   * @param {Object} user - User object with email
   * @param {Object} orderData - Order data with items and totals
   * @param {Object} stripeSession - Optional Stripe session data (unused for now but kept for future use)
   * @returns {Object} Object with html, text, and headers for the email
   */
  static generateOrderConfirmationEmail(user, orderData, stripeSession = null) {
    const orderItems = orderData.items;
    const totalAmount = orderData[OrderFields.AMOUNT_TOTAL];
    const orderDate = new Date().toLocaleDateString("nl-NL");
    const paymentMethod =
      orderData[OrderFields.PAYMENT_METHOD] === "stripe"
        ? "Online betaling"
        : "Handmatige betaling";

    // Generate plain text version for better deliverability
    const textContent = this._generatePlainTextContent(
      user,
      orderData,
      orderItems,
      orderDate,
      paymentMethod
    );

    // Generate HTML version
    const htmlContent = this._generateHtmlContent(
      user,
      orderData,
      orderItems,
      orderDate,
      paymentMethod,
      totalAmount
    );

    // Enhanced headers for better deliverability
    const enhancedHeaders = this._generateEmailHeaders(orderData.orderId);

    return {
      html: htmlContent,
      text: textContent,
      headers: enhancedHeaders,
      subject: `Bestelling bevestiging - Lod Lavki`,
      from: this._getFromAddress(),
    };
  }

  /**
   * Generate plain text version of the email
   * @private
   */
  static _generatePlainTextContent(
    user,
    orderData,
    orderItems,
    orderDate,
    paymentMethod
  ) {
    const itemsList = orderItems
      .map(
        (item) =>
          `- ${item[OrderItemFields.PRODUCT_NAME]} (${
            item[OrderItemFields.QUANTITY]
          }x) - €${item[OrderItemFields.UNIT_PRICE]} = €${
            item[OrderItemFields.AMOUNT_TOTAL]
          }`
      )
      .join("\n");

    return `
BESTELLING BEVESTIGING - Scouts Webshop

Bedankt voor je bestelling!

Je bestelling is succesvol geplaatst en wordt nu verwerkt.

BESTELLING DETAILS:
Bestelnummer: ${orderData.orderId}
Datum: ${orderDate}
Totaalbedrag: €${orderData[OrderFields.AMOUNT_TOTAL]}
Betaalmethode: ${paymentMethod}

BESTELDE ITEMS:
${itemsList}

Totaal: €${orderData[OrderFields.AMOUNT_TOTAL]}

KLANT INFORMATIE:
Email: ${user.email}

CONTACT INFORMATIE:
Lodlavki Webshop
Email: groepsleiding@lodlavki.be
Website: https://lodlavki.be
Adres: Scouts Lodlavki, Guffenslaan 27, 3500 Hasselt

UITSCHRIJVEN:
Wil je geen emails meer ontvangen? Stuur een email naar unsubscribe@lodlavki.be

Dit is een automatisch gegenereerde email. Voor vragen kun je contact met ons opnemen via bovenstaande gegevens.

Bedankt voor je vertrouwen in onze webshop!

---
Lodlavki Webshop - Betrouwbaar online bestellen voor scouts
`;
  }

  /**
   * Generate HTML version of the email
   * @private
   */
  static _generateHtmlContent(
    user,
    orderData,
    orderItems,
    orderDate,
    paymentMethod,
    totalAmount
  ) {
    const itemsHtml = orderItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${
          item[OrderItemFields.PRODUCT_NAME]
        }</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${
          item[OrderItemFields.QUANTITY]
        }</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${
          item[OrderItemFields.UNIT_PRICE]
        }</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${
          item[OrderItemFields.AMOUNT_TOTAL]
        }</td>
      </tr>
    `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html lang="nl">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>Bestelling Bevestiging - Scouts Webshop</title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
      </head>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f9fafb; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
        
        <!-- Preheader text for better email client display -->
        <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Arial, Helvetica, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
          Je bestelling ${orderData.orderId} is bevestigd. Totaal: €${totalAmount}. Bedankt voor je vertrouwen in Scouts Webshop.
        </div>

        <!-- Main container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb;">
          <tr>
            <td align="center" style="padding: 20px;">
              
              <!-- Email content wrapper -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981, #16a34a); color: #ffffff; padding: 32px 24px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; line-height: 1.2;">Bedankt voor je bestelling</h1>
                    <p style="margin: 12px 0 0 0; font-size: 16px; opacity: 0.9; line-height: 1.4;">Je bestelling is succesvol geplaatst en wordt nu verwerkt</p>
                  </td>
                </tr>

                <!-- Main content -->
                <tr>
                  <td style="padding: 32px 24px;">
                    
                    <!-- Welcome message -->
                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">Hallo,</p>
                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">Hartelijk dank voor je bestelling bij Scouts Webshop. Hieronder vind je de details van je bestelling.</p>
                    
                    <!-- Order Details -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6; border-radius: 8px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h2 style="margin: 0 0 16px 0; color: #10b981; font-size: 18px; font-weight: bold;">Bestelling Details</h2>
                          <p style="margin: 4px 0; font-size: 14px; line-height: 1.5;"><strong>Bestelnummer:</strong> ${orderData.orderId}</p>
                          <p style="margin: 4px 0; font-size: 14px; line-height: 1.5;"><strong>Datum:</strong> ${orderDate}</p>
                          <p style="margin: 4px 0; font-size: 14px; line-height: 1.5;"><strong>Totaalbedrag:</strong> €${totalAmount}</p>
                          <p style="margin: 4px 0; font-size: 14px; line-height: 1.5;"><strong>Betaalmethode:</strong> ${paymentMethod}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Order Items -->
                    <h2 style="margin: 0 0 16px 0; color: #10b981; font-size: 18px; font-weight: bold;">Bestelde Items</h2>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                      <thead>
                        <tr style="background-color: #10b981; color: #ffffff;">
                          <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: bold;">Product</th>
                          <th style="padding: 12px; text-align: center; font-size: 14px; font-weight: bold;">Aantal</th>
                          <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold;">Prijs per stuk</th>
                          <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold;">Totaal</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                      <tfoot>
                        <tr style="background-color: #e5e7eb;">
                          <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; font-size: 14px;">Totaalbedrag:</td>
                          <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 14px;">€${totalAmount}</td>
                        </tr>
                      </tfoot>
                    </table>

                    <!-- Customer Info -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6; border-radius: 8px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h2 style="margin: 0 0 16px 0; color: #10b981; font-size: 18px; font-weight: bold;">Klant Informatie</h2>
                          <p style="margin: 4px 0; font-size: 14px; line-height: 1.5;"><strong>Email:</strong> ${user.email}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Contact Information -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 16px;">
                          <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 16px; font-weight: bold;">Contact Informatie</h3>
                          <p style="margin: 4px 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
                            <strong>Email:</strong> groepsleiding@lodlavki.be<br>
                            <strong>Website:</strong> https://lodlavki.be<br>
                            <strong>Adres:</strong> Scouts Lodlavki, Guffenslaan 27, 3500 Hasselt
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Unsubscribe Link -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 16px;">
                      <tr>
                        <td style="text-align: center; padding: 8px;">
                          <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.4;">
                            Wil je geen bestelling bevestigingen meer ontvangen? 
                            <a href="mailto:unsubscribe@lodlavki.be?subject=Unsubscribe" style="color: #10b981; text-decoration: underline;">Uitschrijven</a>
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f3f4f6; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      Bedankt voor je vertrouwen in Lodlavki Webshop
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.4;">
                      Dit is een automatisch gegenereerde email van je bestelling.<br>
                      Voor vragen kun je contact met ons opnemen via Groepsleiding@lodlavki.be
                    </p>
                  </td>
                </tr>

              </table>
              
            </td>
          </tr>
        </table>
        
      </body>
      </html>
    `;
  }

  /**
   * Generate payment failure email template (for future use)
   * @param {Object} user - User object
   * @param {Object} orderData - Order data
   * @returns {string} HTML email content
   */
  static generatePaymentFailureEmail(user, orderData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Betaling Mislukt</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Betaling Mislukt</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Er is een probleem opgetreden met je betaling</p>
          </div>

          <!-- Content -->
          <div style="padding: 32px 24px;">
            <p>Hallo ${user.email},</p>
            <p>Helaas is er een probleem opgetreden bij het verwerken van je betaling voor bestelling ${orderData.orderId}.</p>
            <p>Je kunt het opnieuw proberen of contact met ons opnemen voor hulp.</p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f3f4f6; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Scouts Webshop
            </p>
          </div>

        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate enhanced email headers for better deliverability
   * @private
   */
  static _generateEmailHeaders(orderId) {
    const organizationEmail =
      process.env.GMAIL_USER_EMAIL || "noreply@lodlavki.be";
    const organizationDomain = organizationEmail.split("@")[1] || "lodlavki.be";

    return {
      "Message-ID": `<${orderId}-${Date.now()}@${organizationDomain}>`,
      "Return-Path": organizationEmail,
      "Reply-To": organizationEmail,
      "List-Unsubscribe": `<mailto:unsubscribe@${organizationDomain}?subject=Unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      "X-Priority": "3",
      "X-MSMail-Priority": "Normal",
      "X-Mailer": "Lodlavki Webshop System v1.0",
      "X-Auto-Response-Suppress": "OOF, AutoReply",
      Precedence: "bulk",
      "MIME-Version": "1.0",
    };
  }

  /**
   * Get properly formatted From address
   * @private
   */
  static _getFromAddress() {
    const fromName = process.env.GMAIL_FROM_NAME || "Lodlavki Webshop";
    const fromEmail = process.env.GMAIL_USER_EMAIL || "noreply@lodlavki.be";
    return `"${fromName}" <${fromEmail}>`;
  }
}

module.exports = EmailTemplates;
