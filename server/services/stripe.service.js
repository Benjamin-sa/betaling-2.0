const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const storageService = require('./storage.service');

class StripeService {
  /**
   * Creëer een checkout sessie met lokaal opgeslagen productdata
   */
  async createCheckoutSession(items) {
    try {
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
        success_url: `${process.env.VITE_APP_URL}/success`,
        cancel_url: `${process.env.VITE_APP_URL}/cancel`,
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
   * Maak een Stripe product en prijs aan, en sla lokaal op
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

      // Voeg het nieuwe product toe aan lokale opslag
      const savedProduct = await storageService.saveProduct({
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        stripeProductId: product.id,
        stripePriceId: price.id,
      });

      return { product: savedProduct, price };
    } catch (error) {
      console.error('Error creating product:', error);
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

      // Verwijder het product uit lokale opslag
      const product = await storageService.getProduct(productId);
      if (product) {
        await storageService.deleteProduct(productId);
      }
    } catch (error) {
      console.error('Error deactivating product:', error);
      throw error;
    }
  }
}

module.exports = new StripeService();
