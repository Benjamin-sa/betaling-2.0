// routes/product.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const stripeService = require('../services/stripe.service');
const storageService = require('../services/storage.service');
const { authenticate, authorizeAdmin } = require('../middleware/auth');


router.get('/', async (req, res) => {
  try {
    const products = await storageService.getAllProducts(); // Haal producten lokaal op
    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, authorizeAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price } = req.body;

    // Upload afbeelding lokaal
    const imageUrl = req.file
      ? await storageService.uploadImage(req.file)
      : null;

    // Creëer Stripe-product
    const { product, price: priceData } = await stripeService.createProduct({
      name,
      description,
      price,
    });

    // Sla productinformatie lokaal op
    const savedProduct = await storageService.saveProduct({
      name,
      description,
      price: parseFloat(price),
      imageUrl, // Lokale afbeeldings-URL
      stripeProductId: product.id,
      stripePriceId: priceData.id,
    });

    res.json({ success: true, product: savedProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Haal het product lokaal op
    const product = await storageService.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Deactiveer Stripe-product als er een Stripe ID is
    if (product.stripeProductId) {
      await stripeService.deactivateProduct(product.stripeProductId);
    }

    // Verwijder product lokaal
    const deletedProduct = await storageService.deleteProduct(req.params.id);

    res.json({ success: true, product: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;