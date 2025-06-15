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

    // Webhook routes must be before express.json() to handle raw body
    app.use("/api/webhooks", require("./features/webhooks/webhook.routes"));

    // Parse JSON bodies for all other routes
    app.use(express.json());

    // Serve static files from client build
    app.use(express.static(path.join(__dirname, "client/dist")));

    // API routes
    app.use("/api", require("./core/routes/api.routes"));

    // Health check endpoint for Docker
    app.get("/api/health", (req, res) => {
      res
        .status(200)
        .json({ status: "OK", timestamp: new Date().toISOString() });
    });

    // Handle SPA routing - serve Vue app for all non-API routes
    app.get("*", (req, res) => {
      // Don't serve the SPA for API routes
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }

      res.sendFile(path.join(__dirname, "client/dist", "index.html"));
    });

    // Start server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
