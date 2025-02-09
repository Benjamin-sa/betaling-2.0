// services/webhook.service.js
const mailService = require('./mail.service');
const userService = require('./user.service');
const db = require('../db').instance;
// webhook.service.js
class WebhookService {
  
  // Handle incoming Stripe webhook events for successful checkout sessions
  async handleCheckoutSession(session) {
    try {
      console.log('Processing checkout session:', session.id);

      if (!session.customer_details?.email) {
        throw new Error('Customer email not found in session');
      }

      if (!session.line_items?.data?.length) {
        throw new Error('No line items found in session');
      }

      const order = await this.createOrderFromSession(session);

      // Save order with transaction to ensure atomicity
      await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');
  
          db.run(
            'INSERT INTO orders (id, user_id, amount_total, currency, time_slot) VALUES (?, ?, ?, ?, ?)',
            [order.id, order.user_id, order.amount_total, order.currency, order.time_slot || null],
            (err) => {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }
  
              // Insert order items
              const itemStmt = db.prepare(
                'INSERT INTO order_items (order_id, product_name, quantity, amount_total, unit_price) VALUES (?, ?, ?, ?, ?)'
              );
  
              order.items.forEach(item => {
                itemStmt.run([order.id, item.description, item.quantity, item.amount, item.unit_price]);
              });
  
              itemStmt.finalize();
  
              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
                resolve();
              });
            }
          );
        });
      });

      // Send order confirmation email only from webhook
      if (session.status === 'complete') {
        await this.sendOrderConfirmationEmail(order, session.customer_details);
        console.log(`Order confirmation email sent to ${session.customer_details.email}`);
      }
    } catch (error) {
      console.error('Error processing checkout session:', error);
      throw error;
    }
  }

  async createOrderFromSession(session) {
    // Get user by Stripe customer ID
    let user;
  
    if (session.customer) {
      console.log('Getting user by Stripe ID:', session.customer);
      user = await userService.getUserByStripeId(session.customer);
    }
  
    if (!user && session.customer_details?.email) {
      console.log('Getting user by email:', session.customer_details.email);
      user = await userService.getUserByEmail(session.customer_details.email);
    }
  
    if (!user) {
      throw new Error('User not found for the given customer information');
    }
  
    const orderItems = session.line_items.data.map(item => ({
      description: item.description,
      quantity: item.quantity,
      amount: (item.amount_total / 100).toFixed(2),
      unit_price: (item.price.unit_amount / 100).toFixed(2)
    }));
  
    // Only check time slot capacity if the order has a time slot
    const timeSlot = session.metadata?.timeSlot;
    if (timeSlot) {
      const orderCount = await new Promise((resolve, reject) => {
        db.get(
          'SELECT COUNT(*) as count FROM orders WHERE time_slot = ?',
          [timeSlot],
          (err, row) => {
            if (err) reject(err);
            resolve(row.count);
          }
        );
      });
  
      if (orderCount >= 120) {
        throw new Error('Timeslot is full');
      }
    }
  
    // Create order object
    return {
      id: session.id,
      user_id: user.firebase_uid,
      items: orderItems,
      amount_total: (session.amount_total / 100).toFixed(2),
      currency: session.currency.toUpperCase(),
      time_slot: timeSlot || null  // Allow null for orders without time slot
    };
  }

  async sendOrderConfirmationEmail(order, customerDetails) {
    console.log('Sending confirmation email for order:', order);
    const emailData = {
      id: order.id,
      items: order.items,
      amount_total: order.amount_total,
      time_slot: order.time_slot || 'Geen tijdslot vereist',  // Provide default text for orders without time slot
      currency: order.currency
    };
  
    await mailService.sendOrderConfirmation(emailData, {
      email: customerDetails.email,
      name: customerDetails.name || customerDetails.email,
      address: customerDetails.address
    });
    
    console.log(`Order confirmation email sent to ${customerDetails.email}`);
  }
}

module.exports = new WebhookService();