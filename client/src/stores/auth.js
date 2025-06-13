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

  // Simple token getter - Firebase handles validation and refresh
  const getFirebaseToken = async () => {
    if (!user.value) return null;

    try {
      // Firebase automatically checks validity and refreshes if needed
      const token = await user.value.getIdToken();
      return token;
    } catch (error) {
      console.error("Error getting Firebase token:", error);
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

      user.value = userCredential.user;
      token.value = await getFirebaseToken();
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
      token.value = await getFirebaseToken();

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
        token.value = await getFirebaseToken();
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
