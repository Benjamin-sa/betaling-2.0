// server/services/order.service.js
const admin = require("../config/firebaseAdmin");

class OrderService {
  constructor() {
    this.db = admin.firestore();
  }
  async getAllOrdersWithItems() {
    try {
      const ordersSnapshot = await this.db
        .collection("orders")
        .orderBy("createdAt", "desc")
        .get();
      const usersSnapshot = await this.db.collection("users").get();

      // Create user lookup
      const users = {};
      usersSnapshot.forEach((doc) => {
        users[doc.id] = doc.data();
      });

      const allOrdersWithItems = [];

      for (const orderDoc of ordersSnapshot.docs) {
        const orderData = orderDoc.data();
        const orderItemsSnapshot = await this.db
          .collection("orders")
          .doc(orderDoc.id)
          .collection("items")
          .get();

        const user = users[orderData.userId];
        const confirmedByUser = orderData.manualPaymentConfirmedBy
          ? users[orderData.manualPaymentConfirmedBy]
          : null;

        orderItemsSnapshot.forEach((itemDoc) => {
          const itemData = itemDoc.data();
          allOrdersWithItems.push({
            order_id: orderDoc.id,
            created_at: orderData.createdAt,
            time_slot: orderData.timeSlot,
            payment_method: orderData.paymentMethod,
            manual_payment_confirmed_at: orderData.manualPaymentConfirmedAt,
            manual_payment_confirmed_by: orderData.manualPaymentConfirmedBy,
            email: user?.email,
            product_name: itemData.productName,
            quantity: itemData.quantity,
            amount_total: itemData.amountTotal,
            confirmed_by_email: confirmedByUser?.email,
            payment_status:
              orderData.paymentMethod === "stripe"
                ? "paid"
                : orderData.manualPaymentConfirmedAt
                ? "manual_confirmed"
                : "manual_pending",
            confirmation_details: orderData.manualPaymentConfirmedAt
              ? {
                  confirmed_at: orderData.manualPaymentConfirmedAt,
                  confirmed_by: confirmedByUser?.email,
                }
              : null,
          });
        });
      }

      return allOrdersWithItems;
    } catch (error) {
      throw error;
    }
  }

  // Save order and order items to the database
  async createOrder(order) {
    try {
      // Create order document
      await this.db
        .collection("orders")
        .doc(order.id)
        .set({
          userId: order.user_id,
          amountTotal: order.amount_total,
          currency: order.currency,
          paymentMethod: order.payment_method || "stripe",
          timeSlot: order.time_slot || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // Create order items subcollection
      const itemsRef = this.db
        .collection("orders")
        .doc(order.id)
        .collection("items");

      for (const item of order.items) {
        await itemsRef.add({
          productName: item.description,
          quantity: item.quantity,
          amountTotal: item.amount,
          unitPrice: item.unit_price,
        });
      }

      return order.id;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OrderService();
