// src/stores/auth.js
import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';
import { auth } from '@/config/firebase';
import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, sendEmailVerification} from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);
  const loading = ref(true);
  const error = ref(null);
  const isAdmin = ref(false);

  // Register a new user
  const register = async (email, password) => {
    try {
      error.value = null;
      loading.value = true;
      
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

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
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Controleer of e-mail geverifieerd is
      if (!userCredential.user.emailVerified) {
        // Stuur nieuwe verificatie e-mail als die nog niet geverifieerd is
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        throw new Error('E-mailadres nog niet geverifieerd. Nieuwe verificatie e-mail verzonden.');
      }
      user.value = userCredential.user;
      token.value = await userCredential.user.getIdToken();


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
      token.value = await userCredential.user.getIdToken();

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // Send new verification email if not verified yet
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        throw new Error('E-mailadres nog niet geverifieerd. Nieuwe verificatie e-mail verzonden.');
      }

      // Check if user is already in the database
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/ensure-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to ensure user exists in backend.');
      }

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
      alert('Password reset email sent');
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
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/admin-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.value}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin status');
      }

      const data = await response.json();
      isAdmin.value = data.isAdmin;
    } catch (e) {
      console.error('Error fetching admin status:', e.message);
      isAdmin.value = false;
    }
  };

  // Make a user an admin (Admin only)
  const makeUserAdmin = async (email) => {
    try {
      error.value = null;
      loading.value = true;
      
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/make-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to make user admin');
      }

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
    register,
    login: loginUser,
    loginWithGoogle,
    resetPassword,
    logout,
    makeUserAdmin,
    fetchAdminStatus
  };
});