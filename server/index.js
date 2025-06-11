require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Add HTTPS enforcement middleware
const enforceHttps = (req, res, next) => {
  const shouldForceHttps =
    process.env.NODE_ENV === "production" || process.env.FORCE_HTTPS === "true";

  if (shouldForceHttps) {
    if (req.headers["x-forwarded-proto"] !== "https") {
      // Handle both social media browsers and regular browsers
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
  }
  next();
};

async function startServer() {
  try {
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(enforceHttps);

    // Middleware setup
    app.use(cors());
    // Important: Use raw body parser for webhook route
    app.use("/webhook/stripe", express.raw({ type: "application/json" }));
    // Parse JSON bodies for all other routes
    app.use(express.json());

    app.use(express.static(path.join(__dirname, "../client/dist")));

    // Routes for webshop
    app.use("/api/products", require("./routes/webshop/product.routes"));
    app.use("/api/checkout", require("./routes/webshop/checkout.routes"));
    app.use("/api/auth", require("./routes/auth.routes"));
    app.use("/api/orders", require("./routes/webshop/order.routes"));
    app.use("/webhook", require("./routes/webshop/webhook.routes"));
    app.use("/api/admin", require("./routes/admin.routes"));

    // Handle SPA routing - must be after API routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });

    // Start server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
