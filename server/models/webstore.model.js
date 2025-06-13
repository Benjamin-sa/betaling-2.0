// server/models/webstore.model.js

/**
 * Field name constants for consistent usage across the project
 */
const ProductFields = {
  NAME: "name",
  DESCRIPTION: "description",
  PRICE: "price",
  STRIPE_PRODUCT_ID: "stripeProductId",
  STRIPE_PRICE_ID: "stripePriceId",
  REQUIRES_TIMESLOT: "requiresTimeslot",
  IMAGE: "image",
  IMAGE_TYPE: "imageType",
  IMAGE_URL: "imageUrl", // For consistency with controller usage
  CREATED_AT: "createdAt",
};

const UserFields = {
  FIREBASE_UID: "firebaseUid",
  EMAIL: "email",
  STRIPE_CUSTOMER_ID: "stripeCustomerId",
  IS_ADMIN: "isAdmin",
  CREATED_AT: "createdAt",
};

const OrderFields = {
  USER_ID: "userId",
  AMOUNT_TOTAL: "amountTotal",
  CURRENCY: "currency",
  PAYMENT_METHOD: "paymentMethod",
  TIME_SLOT: "timeSlot",
  MANUAL_PAYMENT_CONFIRMED_AT: "manualPaymentConfirmedAt",
  MANUAL_PAYMENT_CONFIRMED_BY: "manualPaymentConfirmedBy",
  CREATED_AT: "createdAt",
};

const OrderItemFields = {
  PRODUCT_NAME: "productName",
  QUANTITY: "quantity",
  AMOUNT_TOTAL: "amountTotal",
  UNIT_PRICE: "unitPrice",
};

module.exports = {
  ProductFields,
  UserFields,
  OrderFields,
  OrderItemFields,
};
