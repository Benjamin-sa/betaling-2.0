// server/config/firebaseAdmin.js
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const { decodeBase64ServiceAccount } = require("../utils/utils");

// Laad environment variables uit .env
dotenv.config();

if (process.env.env === "production") {
  // Production: gebruik base64 service account
  const serviceAccount = decodeBase64ServiceAccount(
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  // Development: gebruik JSON bestand
  const serviceAccount = require("./scoutswinkel-firebase-adminsdk.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
