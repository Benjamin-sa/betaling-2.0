// server/services/mail.service.js
const sgMail = require('@sendgrid/mail');

class MailService {
  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY environment variable is required');
    }
    if (!process.env.SENDGRID_FROM_EMAIL) {
      throw new Error('SENDGRID_FROM_EMAIL environment variable is required');
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.from = {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Scouts Lod Lavki'
    };
  }

  async sendOrderConfirmation(order, customer) {
    console.log('Sending email with data:', { order, customer });
    const msg = {
      to: customer.email,
      from: this.from,
      templateId: process.env.SENDGRID_ORDER_TEMPLATE_ID,
      dynamicTemplateData: {
        orderNumber: order.id,
        orderItems: order.items,
        totalAmount: order.amount_total,
        time_slot: order.time_slot?.replace('-', ' - '), // Changed to match template variable
        customerName: customer.name
      }
    };
    
    try {
      await sgMail.send(msg);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending order confirmation email:', error.response?.body || error);
      throw error;
    }
  }

  async sendVerificationEmail(user, verificationLink) {
    const msg = {
      to: user.email,
      from: this.from,
      subject: 'Verifieer je email - Scouts Lod Lavki',
      templateId: process.env.SENDGRID_VERIFY_TEMPLATE_ID,
      dynamicTemplateData: {
        customerName: user.name || user.email, // Fallback to email if name is not set
        verificationLink,
        subject: 'Verifieer je email - Scouts Lod Lavki'
      }
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending verification email:', error.response?.body || error);
      throw error;
    }
  }
}

module.exports = new MailService();