// server/core/controllers/base.controller.js

// Common HTTP Status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Common error messages
const ERROR_MESSAGES = {
  INTERNAL_SERVER: "Internal Server Error",
  INVALID_REQUEST: "Invalid request data",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized access",
  VALIDATION_FAILED: "Validation failed",
};

// Common success messages
const SUCCESS_MESSAGES = {
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",
};

/**
 * Base controller class with common functionality
 * All other controllers should extend from this class
 */
class BaseController {
  constructor() {
    this.HTTP_STATUS = HTTP_STATUS;
    this.ERROR_MESSAGES = ERROR_MESSAGES;
    this.SUCCESS_MESSAGES = SUCCESS_MESSAGES;
  }

  /**
   * Send standardized success response
   * @protected
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  _sendSuccessResponse(
    res,
    data = {},
    message = null,
    statusCode = HTTP_STATUS.OK
  ) {
    const response = { ...data };
    if (message) response.message = message;
    res.status(statusCode).json(response);
  }

  /**
   * Send standardized error response
   * @protected
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  _sendErrorResponse(
    res,
    message = ERROR_MESSAGES.INTERNAL_SERVER,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR
  ) {
    res.status(statusCode).json({ error: message });
  }

  /**
   * Validate required fields in request body
   * @protected
   * @param {Object} body - Request body
   * @param {Array} requiredFields - Array of required field names
   * @returns {Object|null} - Returns error object if validation fails, null if success
   */
  _validateRequiredFields(body, requiredFields) {
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return {
        isValid: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Handle async controller methods with automatic error handling
   * @protected
   * @param {Function} controllerMethod - The controller method to execute
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async _handleAsync(controllerMethod, req, res) {
    try {
      await controllerMethod.call(this, req, res);
    } catch (error) {
      console.error(`Controller error in ${controllerMethod.name}:`, error);
      this._sendErrorResponse(
        res,
        error.message || this.ERROR_MESSAGES.INTERNAL_SERVER
      );
    }
  }

  /**
   * Log controller action with consistent format
   * @protected
   * @param {string} action - Action being performed
   * @param {Object} details - Additional details to log
   */
  _logAction(action, details = {}) {
    console.log(`[${this.constructor.name}] ${action}`, details);
  }
}

module.exports = BaseController;
