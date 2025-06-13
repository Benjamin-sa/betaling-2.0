// server/utils/firebaseUtils.js

/**
 * Decode base64 service account from environment variable
 * @param {string} base64String - Base64 encoded service account string
 * @returns {Object} - Parsed service account object
 */
function decodeBase64ServiceAccount(base64String) {
  try {
    // Decodeer de base64-string
    const decodedServiceAccount = Buffer.from(base64String, "base64").toString(
      "utf-8"
    );

    // Parse de JSON-string naar een object
    return JSON.parse(decodedServiceAccount);
  } catch (error) {
    console.error("Failed to decode base64 service account:", error);
    throw new Error("Invalid base64 service account");
  }
}

module.exports = {
  decodeBase64ServiceAccount,
};
