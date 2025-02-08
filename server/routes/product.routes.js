const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const StorageService = require('../services/storage.service');
const StripeService = require('../services/stripe.service');

// Configureer multer om bestanden in het geheugen op te slaan
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limiteer tot 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Alleen afbeeldingen zijn toegestaan'), false);
    }
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await StorageService.getAllProducts();
    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});
/**
 * POST /api/products
 * Voeg een nieuw product toe
 */
router.post('/', authenticate, authorizeAdmin, upload.single('image'), async (req, res) => {
  const { name, description, price } = req.body;
  const image = req.file;

  if (!name || !price) {
    return res.status(400).json({ error: 'Naam en prijs zijn verplicht.' });
  }

  try {
    let imageData = null;
    let imageType = null;

    if (image) {
      imageData = image.buffer; // Buffer met afbeeldingsgegevens
      imageType = image.mimetype; // MIME-type van de afbeelding
    }

    // Create product in Stripe first
    const { product: stripeProduct, price: stripePrice } = await StripeService.createProduct({
      name,
      description,
      price
    });

    // Save product to local storage with Stripe IDs
    const product = await StorageService.saveProduct({
      name,
      description,
      price: parseFloat(price),
      image: imageData,
      imageType,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
    });

    res.status(201).json({
      product,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het toevoegen van het product.' });
  }
});


/**
 * GET /api/products/:id/image
 * Haal de afbeelding op voor een specifiek product
 */
router.get('/:id/image', async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await StorageService.getProductImage(productId);
    if (!product || !product.image) {
      return res.status(404).json({ error: 'Afbeelding niet gevonden.' });
    }

    res.set('Content-Type', product.image_type);
    res.send(product.image);
  } catch (error) {
    console.error('Error fetching product image:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het ophalen van de afbeelding.' });
  }
});


/**
 * DELETE /api/products/:id
 * Verwijder een specifiek product
 */
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  const productId = req.params.id;

  try {
    // First get the product to get Stripe ID
    const product = await StorageService.getProduct(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product niet gevonden.' });
    }

    console.log('Deleting product:', product);

    // Deactivate in Stripe first if Stripe ID exists
    if (product.stripe_product_id) {
      await StripeService.deactivateProduct(product.stripe_product_id);
    }

    // Then delete from local storage
    const result = await StorageService.deleteProduct(productId);
    res.json({ message: 'Product succesvol verwijderd uit lokale opslag en Stripe.', product: result });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het verwijderen van het product.' });
  }
});

module.exports = router;