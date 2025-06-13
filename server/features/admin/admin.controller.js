// server/controllers/admin.controller.js
const firebaseService = require("../../core/services/firebase.service");
const admin = require("../../config/firebaseAdmin");

/**
 * Get all orders with items
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await firebaseService.getAllOrdersWithItems();
    res.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Get all users
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await firebaseService.getAllUsers();
    res.json({
      users: users.map((user) => ({
        firebase_uid: user.id,
        email: user.email,
        is_admin: user.isAdmin || false,
      })),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

/**
 * Make a user admin
 */
const makeUserAdmin = async (req, res) => {
  const { userId } = req.body;

  try {
    await firebaseService.updateUserAdmin(userId, true);
    res.json({ message: "User has been granted admin privileges" });
  } catch (error) {
    console.error("Make Admin error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Remove admin privileges from a user
 */
const removeUserAdmin = async (req, res) => {
  const { userId } = req.body;

  try {
    await firebaseService.updateUserAdmin(userId, false);
    res.json({ message: "Admin privileges removed successfully" });
  } catch (error) {
    console.error("Remove Admin error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Delete a user
 */
const deleteUser = async (req, res) => {
  const { firebaseUid } = req.params;

  try {
    try {
      // Try to delete user from Firebase Auth
      await admin.auth().deleteUser(firebaseUid);
    } catch (firebaseError) {
      // Log the error but continue if user not found in Firebase
      console.log("Firebase user not found:", firebaseError.message);
    }

    // Delete user from database regardless of Firebase result
    await firebaseService.deleteUser(firebaseUid);

    res.json({ message: "User deleted from database successfully" });
  } catch (error) {
    console.error("Error deleting user from database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllOrders,
  getAllUsers,
  makeUserAdmin,
  removeUserAdmin,
  deleteUser,
};
