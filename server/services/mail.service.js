// server/services/mail.service.js
const sgMail = require('@sendgrid/mail');

class MailService {
  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY environment variable is required');
      }
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      this.from = process.env.SENDGRID_FROM_EMAIL;

  }

  async sendOrderConfirmation(order, customer) {
    const msg = {
      to: customer.email,
      from: this.from,
      templateId: process.env.SENDGRID_ORDER_TEMPLATE_ID,
      dynamicTemplateData: {
        orderNumber: order.id,
        orderItems: order.items,
        totalAmount: order.amount_total,
        customerName: customer.name
      }
    };
    
    return sgMail.send(msg);
  }

  async sendVerificationEmail(user, verificationLink) {
    const msg = {
      to: user.email,
      from: this.from,
      templateId: process.env.SENDGRID_VERIFY_TEMPLATE_ID,
      dynamicTemplateData: {
        customerName: user.name || user.email, // Fallback to email if name is not set
        verificationLink
      }
    };

    return sgMail.send(msg);
  }

}

module.exports = new MailService();