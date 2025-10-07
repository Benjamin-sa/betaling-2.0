const express = require("express");
const router = express.Router();
const multer = require("multer");
const { authenticate, authorizeAdmin } = require("../../middleware/auth");
const productController = require("./product.controller");

// Configureer multer om bestanden in het geheugen op te slaan
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // Limiteer tot 5MB per bestand
    files: 5 // Maximaal 5 bestanden per upload
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Alleen afbeeldingen zijn toegestaan"), false);
    }
  },
});

// Get all products
router.get("/", (req, res) => productController.getAllProducts(req, res));

// Create a new product
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  upload.array("images", 5), // Changed from single to array, max 5 images
  (req, res) => productController.createProduct(req, res)
);

// Delete a product
router.delete("/:productId", authenticate, authorizeAdmin, (req, res) =>
  productController.deleteProduct(req, res)
);

module.exports = router;
