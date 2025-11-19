// server/models/webstore.model.js
const { admin } = require("../config/firebaseAdmin");

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
  IMAGES: "images", // New field for multiple images
  EVENT_ID: "eventId",
  IS_TEST_MODE: "isTestMode",
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
  EVENT_ID: "eventId",
  MANUAL_PAYMENT_CONFIRMED_AT: "manualPaymentConfirmedAt",
  MANUAL_PAYMENT_CONFIRMED_BY: "manualPaymentConfirmedBy",
  CREATED_AT: "createdAt",
};

const OrderItemFields = {
  PRODUCT_NAME: "productName",
  QUANTITY: "quantity",
  AMOUNT_TOTAL: "amountTotal",
  UNIT_PRICE: "unitPrice",
  SHIFT_ID: "shiftId",
};

const EmailLogFields = {
  ORDER_ID: "orderId",
  USER_EMAIL: "userEmail",
  STATUS: "status", // "sent", "failed", "skipped"
  SENT_AT: "sentAt",
  ERROR_MESSAGE: "errorMessage",
  EMAIL_TYPE: "emailType", // "order_confirmation"
};

const EventFields = {
  ID: "id",
  TYPE: "type",
  NAME: "name",
  DESCRIPTION: "description",
  ISACTIVE: "isActive",
  START_DATE: "startDate",
  END_DATE: "endDate",
  SHIFTS: "shifts",
  CREATED_AT: "createdAt",
  CREATED_BY: "createdBy",
};

const ShiftFields = {
  ID: "id",
  NAME: "name",
  START_TIME: "startTime",
  END_TIME: "endTime",
  MAX_CAPACITY: "maxCapacity",
  AVAILABLE: "available",
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Generic validation function with flexible field checking
 * @param {Object} data - The data to validate
 * @param {Array|Object} validationConfig - Array of required fields or object with validation rules
 * @param {string} entityName - Name of the entity for error messages
 */
function validateFields(data, validationConfig, entityName = "Entity") {
  const errors = [];

  // Handle simple array of required fields
  if (Array.isArray(validationConfig)) {
    const missing = validationConfig.filter(
      (field) =>
        data[field] === undefined || data[field] === null || data[field] === ""
    );
    if (missing.length > 0) {
      errors.push(`Missing required fields: ${missing.join(", ")}`);
    }
  } else {
    // Handle complex validation rules
    Object.entries(validationConfig).forEach(([field, rules]) => {
      const value = data[field];

      if (
        rules.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`${field} is required`);
        return;
      }

      if (value !== undefined && value !== null && value !== "") {
        if (
          rules.type === "number" &&
          (isNaN(value) || isNaN(parseFloat(value)))
        ) {
          errors.push(`${field} must be a valid number`);
        }

        if (
          rules.type === "email" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
          errors.push(`${field} must be a valid email address`);
        }

        if (
          rules.type === "boolean" &&
          typeof value !== "boolean" &&
          value !== "true" &&
          value !== "false"
        ) {
          errors.push(`${field} must be a boolean value`);
        }

        if (rules.minLength && value.length < rules.minLength) {
          errors.push(
            `${field} must be at least ${rules.minLength} characters long`
          );
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must not exceed ${rules.maxLength} characters`);
        }

        if (rules.min !== undefined && parseFloat(value) < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }

        if (rules.max !== undefined && parseFloat(value) > rules.max) {
          errors.push(`${field} must not exceed ${rules.max}`);
        }
      }
    });
  }

  if (errors.length > 0) {
    throw new Error(`${entityName} validation failed: ${errors.join("; ")}`);
  }
}

/**
 * Transform value to appropriate type
 */
function transformValue(value, type) {
  if (value === undefined || value === null) return value;

  switch (type) {
    case "number":
      return parseFloat(value);
    case "integer":
      return parseInt(value, 10);
    case "boolean":
      return value === true || value === "true";
    case "string":
      return String(value);
    case "timestamp":
      return admin.firestore.FieldValue.serverTimestamp();
    default:
      return value;
  }
}

// ============================================================================
// PRODUCT FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new product data object with validation and proper formatting
 * @param {Object} inputData - Raw input data
 * @param {Object} options - Additional options like event data for validation
 * @returns {Object} Formatted product data ready for database
 */
function createProductData(inputData, options = {}) {
  // Basic validation rules
  const validationRules = {
    [ProductFields.NAME]: {
      required: true,
      type: "string",
      minLength: 1,
      maxLength: 100,
    },
    [ProductFields.PRICE]: { required: true, type: "number", min: 0 },
    [ProductFields.EVENT_ID]: { required: true, type: "string" },
    [ProductFields.STRIPE_PRODUCT_ID]: { required: true, type: "string" },
  };

  // Optional field validation
  if (inputData[ProductFields.DESCRIPTION]) {
    validationRules[ProductFields.DESCRIPTION] = {
      type: "string",
      maxLength: 500,
    };
  }

  if (inputData[ProductFields.REQUIRES_TIMESLOT] !== undefined) {
    validationRules[ProductFields.REQUIRES_TIMESLOT] = { type: "boolean" };
  }

  if (inputData[ProductFields.IS_TEST_MODE] !== undefined) {
    validationRules[ProductFields.IS_TEST_MODE] = { type: "boolean" };
  }

  // Validate basic fields
  validateFields(inputData, validationRules, "Product");

  // Business logic validation for requiresTimeslot
  const requiresTimeslot = transformValue(
    inputData[ProductFields.REQUIRES_TIMESLOT],
    "boolean"
  );
  if (options.event) {
    if (options.event.type === "product_sale" && requiresTimeslot === true) {
      throw new Error(
        "Products in product_sale events cannot require timeslots"
      );
    }
  }

  // Create the formatted product object
  return {
    [ProductFields.NAME]: transformValue(
      inputData[ProductFields.NAME],
      "string"
    ),
    [ProductFields.DESCRIPTION]: transformValue(
      inputData[ProductFields.DESCRIPTION] || "",
      "string"
    ),
    [ProductFields.PRICE]: transformValue(
      inputData[ProductFields.PRICE],
      "number"
    ),
    [ProductFields.EVENT_ID]: transformValue(
      inputData[ProductFields.EVENT_ID],
      "string"
    ),
    [ProductFields.STRIPE_PRODUCT_ID]: transformValue(
      inputData[ProductFields.STRIPE_PRODUCT_ID],
      "string"
    ),
    [ProductFields.STRIPE_PRICE_ID]: transformValue(
      inputData[ProductFields.STRIPE_PRICE_ID] || "",
      "string"
    ),
    [ProductFields.IMAGE]: transformValue(
      inputData[ProductFields.IMAGE] || "",
      "string"
    ),
    [ProductFields.IMAGES]: inputData[ProductFields.IMAGES] || [],
    [ProductFields.REQUIRES_TIMESLOT]: requiresTimeslot || false,
    [ProductFields.IS_TEST_MODE]: transformValue(
      inputData[ProductFields.IS_TEST_MODE] !== undefined
        ? inputData[ProductFields.IS_TEST_MODE]
        : true,
      "boolean"
    ),
    [ProductFields.CREATED_AT]: transformValue(null, "timestamp"),
  };
}

/**
 * Create product update data (excludes createdAt, allows partial updates)
 * @param {Object} inputData - Raw input data
 * @param {Object} options - Additional options
 * @returns {Object} Formatted product update data
 */
function createProductUpdateData(inputData, options = {}) {
  const allowedFields = [
    ProductFields.NAME,
    ProductFields.DESCRIPTION,
    ProductFields.PRICE,
    ProductFields.IMAGE,
    ProductFields.IMAGES,
    ProductFields.REQUIRES_TIMESLOT,
    ProductFields.IS_TEST_MODE,
    ProductFields.STRIPE_PRICE_ID,
  ];

  const updateData = {};
  const validationRules = {};

  // Only validate and include fields that are being updated
  allowedFields.forEach((field) => {
    if (inputData[field] !== undefined) {
      updateData[field] = inputData[field];

      // Add validation rules for fields being updated
      switch (field) {
        case ProductFields.NAME:
          validationRules[field] = {
            required: true,
            type: "string",
            minLength: 1,
            maxLength: 100,
          };
          break;
        case ProductFields.PRICE:
          validationRules[field] = { required: true, type: "number", min: 0 };
          break;
        case ProductFields.DESCRIPTION:
          validationRules[field] = { type: "string", maxLength: 500 };
          break;
        case ProductFields.REQUIRES_TIMESLOT:
          validationRules[field] = { type: "boolean" };
          break;
        case ProductFields.IS_TEST_MODE:
          validationRules[field] = { type: "boolean" };
          break;
      }
    }
  });

  // Validate only the fields being updated
  if (Object.keys(validationRules).length > 0) {
    validateFields(updateData, validationRules, "Product Update");
  }

  // Transform values
  const transformedData = {};
  Object.entries(updateData).forEach(([field, value]) => {
    switch (field) {
      case ProductFields.PRICE:
        transformedData[field] = transformValue(value, "number");
        break;
      case ProductFields.REQUIRES_TIMESLOT:
        transformedData[field] = transformValue(value, "boolean");
        break;
      case ProductFields.IS_TEST_MODE:
        transformedData[field] = transformValue(value, "boolean");
        break;
      case ProductFields.IMAGES:
        transformedData[field] = value;
        break;
      default:
        transformedData[field] = transformValue(value, "string");
    }
  });

  return transformedData;
}

// ============================================================================
// USER FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new user data object
 */
function createUserData(inputData) {
  const validationRules = {
    [UserFields.FIREBASE_UID]: { required: true, type: "string" },
    [UserFields.EMAIL]: { required: true, type: "email" },
    [UserFields.STRIPE_CUSTOMER_ID]: { required: true, type: "string" },
  };

  validateFields(inputData, validationRules, "User");

  return {
    [UserFields.FIREBASE_UID]: transformValue(
      inputData[UserFields.FIREBASE_UID],
      "string"
    ),
    [UserFields.EMAIL]: transformValue(inputData[UserFields.EMAIL], "string"),
    [UserFields.STRIPE_CUSTOMER_ID]: transformValue(
      inputData[UserFields.STRIPE_CUSTOMER_ID],
      "string"
    ),
    [UserFields.IS_ADMIN]: transformValue(
      inputData[UserFields.IS_ADMIN] || false,
      "boolean"
    ),
    [UserFields.CREATED_AT]: transformValue(null, "timestamp"),
  };
}

/**
 * Create user update data
 */
function createUserUpdateData(inputData) {
  const allowedFields = [UserFields.IS_ADMIN];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (inputData[field] !== undefined) {
      updateData[field] = transformValue(inputData[field], "boolean");
    }
  });

  return updateData;
}

// ============================================================================
// ORDER FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new order data object
 */
function createOrderData(inputData) {
  const validationRules = {
    [OrderFields.USER_ID]: { required: true, type: "string" },
    [OrderFields.AMOUNT_TOTAL]: { required: true, type: "number", min: 0 },
  };

  validateFields(inputData, validationRules, "Order");

  return {
    [OrderFields.USER_ID]: transformValue(
      inputData[OrderFields.USER_ID],
      "string"
    ),
    [OrderFields.AMOUNT_TOTAL]: transformValue(
      inputData[OrderFields.AMOUNT_TOTAL],
      "number"
    ),
    [OrderFields.CURRENCY]: transformValue(
      inputData[OrderFields.CURRENCY] || "EUR",
      "string"
    ),
    [OrderFields.PAYMENT_METHOD]: transformValue(
      inputData[OrderFields.PAYMENT_METHOD] || "stripe",
      "string"
    ),
    [OrderFields.TIME_SLOT]: transformValue(
      inputData[OrderFields.TIME_SLOT] || "",
      "string"
    ),
    [OrderFields.EVENT_ID]: transformValue(
      inputData[OrderFields.EVENT_ID] || "",
      "string"
    ),
    [OrderFields.MANUAL_PAYMENT_CONFIRMED_AT]: null,
    [OrderFields.MANUAL_PAYMENT_CONFIRMED_BY]: "",
    [OrderFields.CREATED_AT]: admin.firestore.FieldValue.serverTimestamp(),
  };
}

/**
 * Create order item data object
 */
function createOrderItemData(inputData) {
  const validationRules = {
    [OrderItemFields.PRODUCT_NAME]: { required: true, type: "string" },
    [OrderItemFields.QUANTITY]: { required: true, type: "number", min: 1 },
    [OrderItemFields.AMOUNT_TOTAL]: { required: true, type: "number", min: 0 },
    [OrderItemFields.UNIT_PRICE]: { required: true, type: "number", min: 0 },
  };

  validateFields(inputData, validationRules, "Order Item");

  return {
    [OrderItemFields.PRODUCT_NAME]: transformValue(
      inputData[OrderItemFields.PRODUCT_NAME],
      "string"
    ),
    [OrderItemFields.QUANTITY]: transformValue(
      inputData[OrderItemFields.QUANTITY],
      "integer"
    ),
    [OrderItemFields.AMOUNT_TOTAL]: transformValue(
      inputData[OrderItemFields.AMOUNT_TOTAL],
      "number"
    ),
    [OrderItemFields.UNIT_PRICE]: transformValue(
      inputData[OrderItemFields.UNIT_PRICE],
      "number"
    ),
    [OrderItemFields.SHIFT_ID]: transformValue(
      inputData[OrderItemFields.SHIFT_ID] || "",
      "string"
    ),
  };
}

// ============================================================================
// EMAIL LOG FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new email log data object
 */
function createEmailLogData(inputData) {
  const validationRules = {
    [EmailLogFields.ORDER_ID]: { required: true, type: "string" },
    [EmailLogFields.USER_EMAIL]: { required: true, type: "string" },
    [EmailLogFields.STATUS]: { required: true, type: "string" },
    [EmailLogFields.EMAIL_TYPE]: { required: true, type: "string" },
  };

  validateFields(inputData, validationRules, "Email Log");

  return {
    [EmailLogFields.ORDER_ID]: transformValue(
      inputData[EmailLogFields.ORDER_ID],
      "string"
    ),
    [EmailLogFields.USER_EMAIL]: transformValue(
      inputData[EmailLogFields.USER_EMAIL],
      "string"
    ),
    [EmailLogFields.STATUS]: transformValue(
      inputData[EmailLogFields.STATUS],
      "string"
    ),
    [EmailLogFields.EMAIL_TYPE]: transformValue(
      inputData[EmailLogFields.EMAIL_TYPE],
      "string"
    ),
    [EmailLogFields.ERROR_MESSAGE]: transformValue(
      inputData[EmailLogFields.ERROR_MESSAGE] || null,
      "string"
    ),
    [EmailLogFields.SENT_AT]: admin.firestore.FieldValue.serverTimestamp(),
  };
}

// ============================================================================
// EVENT FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new event data object
 */
function createEventData(inputData) {
  const validationRules = {
    [EventFields.NAME]: {
      required: true,
      type: "string",
      minLength: 1,
      maxLength: 100,
    },
    [EventFields.TYPE]: { required: true, type: "string" },
    [EventFields.CREATED_BY]: { required: true, type: "string" },
  };

  validateFields(inputData, validationRules, "Event");

  return {
    [EventFields.NAME]: transformValue(inputData[EventFields.NAME], "string"),
    [EventFields.DESCRIPTION]: transformValue(
      inputData[EventFields.DESCRIPTION] || "",
      "string"
    ),
    [EventFields.TYPE]: transformValue(inputData[EventFields.TYPE], "string"),
    [EventFields.ISACTIVE]: transformValue(
      inputData[EventFields.ISACTIVE] || true,
      "boolean"
    ),
    [EventFields.START_DATE]: inputData[EventFields.START_DATE] || null,
    [EventFields.END_DATE]: inputData[EventFields.END_DATE] || null,
    [EventFields.SHIFTS]: inputData[EventFields.SHIFTS] || [],
    [EventFields.CREATED_BY]: transformValue(
      inputData[EventFields.CREATED_BY],
      "string"
    ),
    [EventFields.CREATED_AT]: transformValue(null, "timestamp"),
  };
}

// ============================================================================
// SHIFT FACTORY FUNCTIONS
// ============================================================================

/**
 * Validate shift data
 */
function validateShiftData(shiftData) {
  const validationRules = {
    [ShiftFields.NAME]: { required: true, type: "string", minLength: 1 },
    [ShiftFields.START_TIME]: { required: true, type: "string" },
    [ShiftFields.END_TIME]: { required: true, type: "string" },
    [ShiftFields.MAX_CAPACITY]: { required: true, type: "number", min: 1 },
  };

  validateFields(shiftData, validationRules, "Shift");
  return true; // If no error thrown, validation passed
}

/**
 * Validate array of shifts
 */
function validateShifts(shifts) {
  if (!shifts || !Array.isArray(shifts) || shifts.length === 0) {
    throw new Error("Shift events must have at least one shift");
  }

  shifts.forEach((shift, index) => {
    try {
      validateShiftData(shift);
    } catch (error) {
      throw new Error(`Invalid shift data at index ${index}: ${error.message}`);
    }
  });

  return true;
}

module.exports = {
  // Field constants
  ProductFields,
  UserFields,
  OrderFields,
  OrderItemFields,
  EventFields,
  ShiftFields,
  EmailLogFields,

  // Factory functions
  createProductData,
  createProductUpdateData,
  createUserData,
  createUserUpdateData,
  createOrderData,
  createOrderItemData,
  createEmailLogData,
  createEventData,

  // Utility functions
  validateFields,
  transformValue,

  // Shift validation functions
  validateShiftData,
  validateShifts,
};
