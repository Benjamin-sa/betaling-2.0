const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const storageService = require('./storage.service');
const admin = require('../config/firebaseAdmin');

class StripeService {
  /**
   * Creëer een checkout sessie met lokaal opgeslagen productdata
   */
  async createCheckoutSession(items, userId) {
    try {

      // Retrieve user from Firestore
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const { stripeCustomerId } = userDoc.data();
      if (!stripeCustomerId) {
        throw new Error('Stripe customer ID not found for user');
      }


      // Haal alle producten op uit de lokale opslag
      const products = await storageService.getAllProducts();

      // Map producten op basis van hun ID
      const productMap = products.reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {});

      // Maak line items aan
      const lineItems = items.map(item => {
        const product = productMap[item.productId];
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        return {
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(product.price * 100), // Prijs naar centen
            product_data: {
              name: product.name,
              description: product.description,
            },
          },
          quantity: item.quantity,
        };
      });

      // Creëer Stripe Checkout sessie
      return stripe.checkout.sessions.create({
        payment_method_types: ['card', 'ideal'],
        line_items: lineItems,
        mode: 'payment',
        customer: stripeCustomerId,
        success_url: `${process.env.VITE_APP_URL}/success`,
        cancel_url: `${process.env.VITE_APP_URL}/`,
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
  async createProduct(productData) {
    try {
      // Creëer Stripe-product
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
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
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      console.error('Error retrieving checkout session:', error);
      throw error;
    }
  }

  /**
   * Deactiveer een Stripe-product en update lokale opslag
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
