require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST);
const storageService = require('./storage.service');
const userService = require('./user.service');
const webhookService = require('./webhook.service');
class StripeService {

  /**
   * Creates a Stripe Checkout session for the given items and user.
   *
   * @param {Array} items - The items to be purchased. Each item should have a productId and quantity.
   * @param {string} userId - The ID of the user making the purchase.
   * @param {string} timeSlot - The selected time slot for the purchase.
   * @returns {Promise<Object>} - The created Stripe Checkout session.
   * @throws {Error} - Throws an error if the user is not found or if any product is not found.
   */
  async createCheckoutSession(items, userId, timeSlot) {
    try {
      // Get user from SQLite database 
      const user = await userService.getUserByFirebaseId(userId);
      if (!user) {
        throw new Error('User not found');
      }
  
      // Get products from storage
      const products = await storageService.getAllProducts();
      const productMap = products.reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {});
  
      // Check if any selected product requires a time slot
      const requiresTimeSlot = items.some(item => 
        productMap[item.productId]?.requires_timeslot
      );
  
      if (requiresTimeSlot && !timeSlot) {
        throw new Error('Time slot required for some items in cart');
      }
  
      // Create line items
      const lineItems = items.map(item => {
        const product = productMap[item.productId];
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
  
        return {
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(product.price * 100),
            product_data: {
              name: product.name,
              description: product.description,
            },
          },
          quantity: item.quantity,
        };
      });
  
      const baseUrl = process.env.APP_URL || process.env.VITE_APP_URL;
  
      // Only include timeSlot in metadata if required
      const metadata = {
        userId,
        items: JSON.stringify(items)
      };
      if (requiresTimeSlot) {
        metadata.timeSlot = timeSlot;
      }
  
      return stripe.checkout.sessions.create({
        payment_method_types: [
          'card',           // Credit/debit cards
          'ideal',          // iDEAL for Netherlands
          'bancontact',     // Bancontact for Belgium
        ],
        line_items: lineItems,
        mode: 'payment',
        customer: user.stripe_customer_id,
        success_url: `${baseUrl}/success`,
        cancel_url: `${baseUrl}/`,
        metadata
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Haal producten op uit Stripe
   */
  async getProducts() {
    return stripe.products.list({
      expand: ['data.default_price'],
      active: true,
    });
  }

  /**
   * Maak een Stripe product en prijs aan
   */
  /**
   * Creates a new product in Stripe along with its price.
   *
   * @param {Object} productData - The data for the product to be created.
   * @param {string} productData.name - The name of the product.
   * @param {string} productData.description - The description of the product.
   * @param {string} productData.imageUrl - The URL of the product's image.
   * @param {number|string} productData.price - The price of the product in euros.
   * @returns {Promise<Object>} The created product and price objects.
   * @throws Will throw an error if the product creation fails.
   */
  async createProduct(productData) {
    try {
      // Creëer Stripe-product
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description
      });

      // Maak prijs aan in centen
      const priceInCents = Math.round(parseFloat(productData.price) * 100);
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceInCents,
        currency: 'eur',
      });

      // Stel standaardprijs in
      await stripe.products.update(product.id, {
        default_price: price.id,
      });

      return { product, price };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Creëer een Stripe-klant.
   * @param {string} email - Het e-mailadres van de gebruiker
   * @param {string} uid - De UID van de Firebase-gebruiker
   * @returns {object} - Het aangemaakte Stripe-klantobject
   */
  async createCustomer(email, uid) {
    try {
      const customer = await stripe.customers.create({ email });
      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  /**
   * Haal alle Checkout Sessions op voor een specifieke klant
   * @param {string} customerId - De Stripe klant ID
   * @returns {Array} - Een array van Checkout Sessions
   */
  async getCustomerCheckoutSessions(customerId) {
    try {
      const sessions = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 100, // Pas aan indien nodig
      });

      return sessions.data;
    } catch (error) {
      console.error('Error fetching Checkout Sessions:', error);
      throw error;
    }
  }

  async handleWebhookEvent(rawBody, signature) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      throw err;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = await this.getCheckoutSession(event.data.object.id);
          await webhookService.handleCheckoutSession(session);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
          break;
      }
    } catch (error) {
      console.error(`Error handling event ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Haal line items op voor een specifieke Checkout Session
   * @param {string} sessionId - De Stripe Checkout Session ID
   * @returns {Array} - Een array van Line Items
   */
  async getSessionLineItems(sessionId) {
    try {
      const items = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 });
      return items.data;
    } catch (error) {
      console.error('Error fetching session line items:', error);
      throw error;
    }
  }

  /**
   * Haal een specifieke Checkout Session op
   * @param {string} sessionId - De Stripe Checkout Session ID
   * @returns {object} - De Checkout Session object
   */
  async getCheckoutSession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items.data.price.product']
      });
      return session;
    } catch (error) {
      console.error('Error retrieving checkout session:', error);
      throw error;
    }
  }

  /**
   * Deactiveer een Stripe-product en update lokale opslag
   */
  /**
   * Deactivates a product and all associated prices in Stripe.
   *
   * @param {string} productId - The ID of the product to deactivate.
   * @throws Will throw an error if deactivation fails.
   */
  async deactivateProduct(productId) {
    try {
      // Deactiveer product in Stripe
      await stripe.products.update(productId, { active: false });

      // Deactiveer alle prijzen gekoppeld aan dit product
      const prices = await stripe.prices.list({ product: productId });
      for (const price of prices.data) {
        await stripe.prices.update(price.id, { active: false });
      }

    } catch (error) {
      console.error('Error deactivating product:', error);
      throw error;
    }
  }
}

module.exports = new StripeService();
