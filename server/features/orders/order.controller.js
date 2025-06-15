// server/controllers/order.controller.js
const BaseController = require("../../core/controllers/base.controller");
const firebaseService = require("../../core/services/firebase-cached.service");
const stripeService = require("../../core/services/stripe.service");

// Order-specific error messages
const ORDER_ERROR_MESSAGES = {
  FETCH_ORDERS_FAILED: "Failed to fetch user orders",
  CHECKOUT_SESSION_FAILED: "Failed to create checkout session",
  NO_STRIPE_CUSTOMER: "User does not have a Stripe customer ID",
};

class OrderController extends BaseController {
  /**
   * Get all orders for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserOrders(req, res) {
    await this._handleAsync(this._getUserOrdersHandler, req, res);
  }

  /**
   * Internal handler for getting user orders
   * @private
   */
  async _getUserOrdersHandler(req, res) {
    const userId = req.user.uid;
    this._logAction("Fetching user orders", { userId });

    const orders = await firebaseService.getUserOrders(userId);
    this._sendSuccessResponse(res, { orders });
  }

  /**
   * Create a Stripe checkout session for the user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createCheckoutSession(req, res) {
    await this._handleAsync(this._createCheckoutSessionHandler, req, res);
  }

  /**
   * Internal handler for creating checkout session
   * @private
   */
  async _createCheckoutSessionHandler(req, res) {
    const { items, eventId, shiftId } = req.body;
    const userId = req.user.uid;

    // Validate items array - products are always required
    if (!items || !Array.isArray(items) || items.length === 0) {
      return this._sendErrorResponse(
        res,
        "At least one product must be selected",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate event if provided
    if (eventId) {
      const event = await firebaseService.getEvent(eventId);
      if (!event) {
        return this._sendErrorResponse(
          res,
          "Event not found",
          this.HTTP_STATUS.BAD_REQUEST
        );
      }

      // New validation logic for multi-shift support
      if (event.type === "shift_event") {
        // For shift events, check if any products require timeslots
        const products = await firebaseService.getProductsByEvent(eventId);
        const selectedProductIds = items.map((item) => item.productId);
        const selectedProducts = products.filter((product) =>
          selectedProductIds.includes(product.id)
        );

        const hasTimeslotRequiredProducts = selectedProducts.some(
          (product) => product.requiresTimeslot === true
        );

        // If any product requires timeslot, all items with those products must have shiftId
        if (hasTimeslotRequiredProducts) {
          const itemsRequiringTimeslot = items.filter((item) => {
            const product = selectedProducts.find(
              (p) => p.id === item.productId
            );
            return product && product.requiresTimeslot === true;
          });

          const missingShifts = itemsRequiringTimeslot.filter(
            (item) => !item.shiftId
          );
          if (missingShifts.length > 0) {
            return this._sendErrorResponse(
              res,
              "Shift selection is required for products that require timeslots",
              this.HTTP_STATUS.BAD_REQUEST
            );
          }

          // Validate all provided shifts exist
          const allShiftIds = [
            ...new Set(items.map((item) => item.shiftId).filter(Boolean)),
          ];
          for (const shiftId of allShiftIds) {
            const shift = event.shifts?.find((s) => s.id === shiftId);
            if (!shift) {
              return this._sendErrorResponse(
                res,
                `Selected shift ${shiftId} not found`,
                this.HTTP_STATUS.BAD_REQUEST
              );
            }
          }

          // OPTIMIZED CAPACITY VALIDATION - Prevents overbooking with minimal Firebase reads
          const capacityValidation =
            await firebaseService.validateShiftCapacityForCheckout(
              eventId,
              items
            );

          if (!capacityValidation.success) {
            const failedShifts = capacityValidation.failedShifts || [];
            const shiftDetails = failedShifts
              .map(
                (shift) =>
                  `Shift ${shift.shiftId}: requested ${shift.requested}, available ${shift.available}`
              )
              .join("; ");

            return this._sendErrorResponse(
              res,
              `Insufficient capacity for selected shifts. ${shiftDetails}`,
              this.HTTP_STATUS.BAD_REQUEST
            );
          }
        }
      } else if (event.type === "product_sale") {
        // For product_sale events, shift selection is not allowed
        const itemsWithShifts = items.filter((item) => item.shiftId);
        if (itemsWithShifts.length > 0) {
          return this._sendErrorResponse(
            res,
            "Shift selection is not allowed for product sale events",
            this.HTTP_STATUS.BAD_REQUEST
          );
        }
      }
    }

    this._logAction("Creating checkout session", {
      userId,
      itemCount: items.length,
      eventId,
      shiftId,
    });

    // 1. Get user details
    const user = await firebaseService.getUser(userId);

    // 2. Validate user has Stripe customer ID
    if (!user.stripeCustomerId) {
      throw new Error(ORDER_ERROR_MESSAGES.NO_STRIPE_CUSTOMER);
    }

    // 3. Create checkout session with event context (remove top-level shiftId)
    const session = await stripeService.createCheckoutSession(
      items,
      userId,
      user.stripeCustomerId,
      { eventId }
    );

    this._logAction("Checkout session created", { sessionId: session.id });
    this._sendSuccessResponse(res, { sessionId: session.id });
  }

  /**
   * Check shift capacity in real-time (for UI updates)
   */
  async checkShiftCapacity(req, res) {
    await this._handleAsync(this._checkShiftCapacityHandler, req, res);
  }

  /**
   * Internal handler for checking shift capacity
   * @private
   */
  async _checkShiftCapacityHandler(req, res) {
    const { eventId, shiftId } = req.params;
    const { quantity = 1 } = req.query;

    this._logAction("Checking shift capacity", { eventId, shiftId, quantity });

    const capacityCheck = await firebaseService.checkShiftCapacity(
      eventId,
      shiftId,
      parseInt(quantity)
    );

    this._sendSuccessResponse(res, { capacity: capacityCheck });
  }

  /**
   * Batch check shift capacity for multiple shifts
   */
  async batchCheckShiftCapacity(req, res) {
    await this._handleAsync(this._batchCheckShiftCapacityHandler, req, res);
  }

  /**
   * Internal handler for batch checking shift capacity
   * @private
   */
  async _batchCheckShiftCapacityHandler(req, res) {
    const { shiftRequests } = req.body;

    if (!shiftRequests || !Array.isArray(shiftRequests)) {
      return this._sendErrorResponse(
        res,
        "shiftRequests array is required",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    this._logAction("Batch checking shift capacity", {
      requestCount: shiftRequests.length,
    });

    const capacityResults = await firebaseService.batchCheckShiftCapacity(
      shiftRequests
    );

    this._sendSuccessResponse(res, { results: capacityResults });
  }
}

module.exports = new OrderController();
