// server/config/firebaseImages.js
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const { decodeBase64ServiceAccount } = require("../utils/utils");

// Laad environment variables uit .env
dotenv.config();

// Create a separate Firebase app instance for image storage
let imageStorageApp;

if (process.env.env === "production") {
  // Production: gebruik base64 service account
  const serviceAccount = decodeBase64ServiceAccount(
    process.env.FIREBASE_IMAGES_SERVICE_ACCOUNT_BASE64
  );

  imageStorageApp = admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "lod-lavki.firebasestorage.app",
    },
    "imageStorage"
  );
} else {
  // Development: gebruik JSON bestand
  try {
    const serviceAccount = require("./lod-lavki-firebase-adminsdk.json");

    imageStorageApp = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "lod-lavki.firebasestorage.app",
      },
      "imageStorage"
    );
  } catch (error) {
    console.error("Error initializing Firebase image storage app:", error);
    throw error;
  }
}

module.exports = imageStorageApp;
