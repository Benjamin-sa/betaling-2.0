// server/config/firebaseAdmin.js
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Laad environment variables uit .env
dotenv.config();

// Haal de base64-gecodeerde service account op uit de environment variable
const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (base64ServiceAccount) {
  // Decodeer de base64-string
  const decodedServiceAccount = Buffer.from(base64ServiceAccount, 'base64').toString('utf-8');
  
  // Parse de JSON-string naar een object
  const serviceAccount = JSON.parse(decodedServiceAccount);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Voeg hier eventuele extra configuratie toe, zoals databaseURL
  });
} else {
  // Fallback voor lokaal testen met JSON-bestand
  const serviceAccount = require('./scoutswinkel-firebase-adminsdk-ucote-7f034f7aec.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;