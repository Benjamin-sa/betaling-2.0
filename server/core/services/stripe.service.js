require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_TEST);
class StripeService {
  // Maak een nieuwe StripeService instantie
  async createCheckoutSession(items, userId, stripeCustomerId, metadata = {}) {
    try {
      const baseUrl = process.env.APP_URL || process.env.VITE_APP_URL;

      // Transform items into Stripe line_items format
      const lineItems = await Promise.all(
        items.map(async (item) => {
          // Get product from Stripe to find the default price
          const product = await stripe.products.retrieve(item.productId, {
            expand: ["default_price"],
          });

          return {
            price: product.default_price.id,
            quantity: item.quantity,
          };
        })
      );

      // Enhanced session metadata to preserve individual item shift information
      const sessionMetadata = {
        userId,
        items: JSON.stringify(items), // Includes individual shiftIds
        ...metadata, // Include any additional metadata like eventId
      };

      // Create individual shift mapping for order processing
      const shiftMappings = items
        .filter((item) => item.shiftId)
        .reduce((acc, item, index) => {
          acc[`item_${index}_shift`] = item.shiftId;
          acc[`item_${index}_product`] = item.productId;
          return acc;
        }, {});

      // Merge shift mappings into metadata
      Object.assign(sessionMetadata, shiftMappings);

      return stripe.checkout.sessions.create({
        payment_method_types: [
          "card", // Credit/debit cards
          "ideal", // iDEAL for Netherlands
          "bancontact", // Bancontact for Belgium
        ],
        line_items: lineItems,
        mode: "payment",
        customer: stripeCustomerId,
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/`,
        metadata: sessionMetadata,
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
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
      // Destructure the productData object
      const { name, description, price, imageUrl } = productData;

      // Prepare product creation data
      const productCreationData = {
        name,
        description,
      };

      // Add images array if imageUrl is provided
      if (imageUrl) {
        productCreationData.images = [imageUrl];
      }

      // Creëer Stripe-product
      const product = await stripe.products.create(productCreationData);

      // Maak prijs aan in centen
      const priceInCents = Math.round(parseFloat(price) * 100);
      const stripePrice = await stripe.prices.create({
        product: product.id,
        unit_amount: priceInCents,
        currency: "eur",
      });

      // Stel standaardprijs in
      await stripe.products.update(product.id, {
        default_price: stripePrice.id,
      });

      return { product, price: stripePrice };
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  /**
   * Controleer of een Stripe-klant met het opgegeven e-mailadres bestaat.
   * Als de klant niet bestaat, maak dan een nieuwe aan.
   * @param {string} email - Het e-mailadres van de gebruiker
   * @param {string} uid - De UID van de Firebase-gebruiker (optioneel, voor metadata)
   * @returns {object} - Het Stripe-klantobject (bestaand of nieuw aangemaakt)
   */
  async findOrCreateCustomer(email, uid = null) {
    try {
      // Zoek naar bestaande klanten met dit e-mailadres
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      // Als er al een klant bestaat met dit e-mailadres, retourneer deze
      if (existingCustomers.data.length > 0) {
        console.log(`Found existing Stripe customer for email: ${email}`);
        return existingCustomers.data[0];
      }

      // Geen bestaande klant gevonden, maak een nieuwe aan
      console.log(`Creating new Stripe customer for email: ${email}`);
      const customer = await stripe.customers.create({
        email: email,
        metadata: uid ? { firebaseUid: uid } : undefined,
      });

      return customer;
    } catch (error) {
      console.error("Error finding or creating Stripe customer:", error);
      throw error;
    }
  }
  /**
   * Validate Stripe webhook event and return the event object
   * @param {Buffer} rawBody - The raw request body
   * @param {string} signature - The Stripe signature header
   * @returns {Object} - The validated Stripe event object
   */
  async validateWebhookEvent(rawBody, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      throw err;
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
        expand: ["line_items.data.price.product"],
      });
      return session;
    } catch (error) {
      console.error("Error retrieving checkout session:", error);
      throw error;
    }
  }
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
      console.error("Error deactivating product:", error);
      throw error;
    }
  }
}

module.exports = new StripeService();
