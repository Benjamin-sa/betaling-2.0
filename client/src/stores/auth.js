// src/stores/auth.js
import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import { auth } from "@/config/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { apiClient, setTokenProvider } from "@/services/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(null);
  const loading = ref(true);
  const error = ref(null);
  const isAdmin = ref(false);

  // Optimized token getter with caching
  const getFirebaseToken = async () => {
    if (!user.value) return null;

    try {
      // Check if we have a cached token first
      if (token.value) {
        // Firebase tokens are valid for 1 hour, let's use cached token
        // Firebase SDK automatically refreshes if needed
        return token.value;
      }

      // Get fresh token from Firebase
      const freshToken = await user.value.getIdToken();
      token.value = freshToken; // Cache it
      return freshToken;
    } catch (error) {
      console.error("Error getting Firebase token:", error);
      token.value = null; // Clear invalid token
      return null;
    }
  };

  // Set up the token provider for the API service to avoid circular dependency
  setTokenProvider(getFirebaseToken);

  // Register a new user
  const register = async (email, password) => {
    try {
      error.value = null;
      loading.value = true;

      await apiClient.register(email, password);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Log in the user using Firebase Auth SDK
  const loginUser = async (email, password) => {
    try {
      error.value = null;
      loading.value = true;

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      await apiClient.ensureUser();
      user.value = userCredential.user;
      // Get fresh token and cache it
      token.value = await user.value.getIdToken();
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Log in the user using Google
  const loginWithGoogle = async () => {
    try {
      error.value = null;
      loading.value = true;

      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      user.value = userCredential.user;
      // Get fresh token and cache it
      token.value = await user.value.getIdToken();

      // Check if user is already in the database
      await apiClient.ensureUser();
      await fetchAdminStatus();
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      error.value = null;
      loading.value = true;
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent");
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Log out the user
  const logout = async () => {
    try {
      error.value = null;
      loading.value = true;
      await signOut(auth);
      user.value = null;
      token.value = null;
      isAdmin.value = false;
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch admin status from the backend
   */
  const fetchAdminStatus = async () => {
    if (!token.value) return;
    try {
      const data = await apiClient.getAdminStatus();
      isAdmin.value = data.isAdmin;
    } catch (e) {
      console.error("Error fetching admin status:", e.message);
      isAdmin.value = false;
    }
  };

  // Make a user an admin (Admin only)
  const makeUserAdmin = async (email) => {
    try {
      error.value = null;
      loading.value = true;

      await apiClient.makeUserAdminById(email);
      alert(`${email} is now an admin.`);
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Listen to auth state changes
  onMounted(() => {
    auth.onIdTokenChanged(async (currentUser) => {
      if (currentUser) {
        user.value = currentUser;
        // Get fresh token and cache it
        token.value = await currentUser.getIdToken();
        await fetchAdminStatus();
      } else {
        user.value = null;
        token.value = null;
        isAdmin.value = false;
      }
      loading.value = false;
    });
  });

  return {
    user,
    token,
    loading,
    error,
    isAdmin,
    getFirebaseToken,
    register,
    login: loginUser,
    loginWithGoogle,
    resetPassword,
    logout,
    makeUserAdmin,
    fetchAdminStatus,
  };
});
