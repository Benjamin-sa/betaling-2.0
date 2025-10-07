const admin = require("firebase-admin");

if (!admin.apps.length) {
  try {
    const config = {
      projectId: "lod-lavki-project",
      storageBucket: "lod-lavki-project.firebasestorage.app",
      credential: admin.credential.applicationDefault(),
    };

    admin.initializeApp(config);
    console.log(
      "✅ Firebase Admin initialized successfully with custom database"
    );
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error.message);
    throw error;
  }
}

const bucket = admin.storage().bucket();
module.exports = { admin, bucket };
