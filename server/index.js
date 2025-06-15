require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

async function startServer() {
  try {
    const app = express();
    const port = process.env.PORT || 8080; // Changed from 3000 to 8080

    // Debug: Check if client files exist
    const clientDistPath = path.join(__dirname, "client/dist");
    const indexPath = path.join(clientDistPath, "index.html");

    console.log("Client dist path:", clientDistPath);
    console.log("Index.html path:", indexPath);
    console.log("Client dist exists:", fs.existsSync(clientDistPath));
    console.log("Index.html exists:", fs.existsSync(indexPath));

    if (fs.existsSync(clientDistPath)) {
      const files = fs.readdirSync(clientDistPath);
      console.log("Files in client/dist:", files);
    }

    // Middleware setup
    app.use(cors());

    // Webhook routes must be before express.json() to handle raw body
    app.use("/api/webhooks", require("./features/webhooks/webhook.routes"));

    // Parse JSON bodies for all other routes
    app.use(express.json());

    // Serve static files from client build with better error handling
    app.use(
      express.static(clientDistPath, {
        dotfiles: "ignore",
        etag: false,
        extensions: ["htm", "html"],
        index: false,
        maxAge: "1d",
        redirect: false,
        setHeaders: function (res, path, stat) {
          res.set("x-timestamp", Date.now());
        },
      })
    );

    // API routes
    app.use("/api", require("./core/routes/api.routes"));

    // Health check endpoint for Docker
    app.get("/api/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        clientFilesExist: fs.existsSync(indexPath),
      });
    });

    // Handle SPA routing - serve Vue app for all non-API routes
    app.get("*", (req, res) => {
      // Don't serve the SPA for API routes
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }

      console.log("Serving SPA for path:", req.path);

      // Check if index.html exists before serving
      if (!fs.existsSync(indexPath)) {
        console.error("index.html not found at:", indexPath);
        return res.status(500).json({
          error: "Client application not built",
          path: indexPath,
          exists: fs.existsSync(indexPath),
        });
      }

      res.sendFile(indexPath);
    });

    // Start server
    app.listen(port, "0.0.0.0", () => {
      // Added '0.0.0.0' for Docker compatibility
      console.log(`Server running at http://0.0.0.0:${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
