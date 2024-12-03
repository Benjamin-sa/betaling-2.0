import { defineStore } from 'pinia';
import { auth, db } from '@/config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection,
  getDocs
} from 'firebase/firestore';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const loading = ref(true);
  const error = ref(null);
  const isAdmin = ref(false);

  // Check if user is admin
  const checkAdminStatus = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        isAdmin.value = userDoc.data().isAdmin === true;
      } else {
        // Create user document if it doesn't exist
        await setDoc(doc(db, 'users', userId), {
          isAdmin: false,
          email: auth.currentUser.email,
          createdAt: new Date()
        });
        isAdmin.value = false;
      }
    } catch (e) {
      console.error('Error checking admin status:', e);
      isAdmin.value = false;
    }
  };

  // Initialize auth state listener
  onAuthStateChanged(auth, async (newUser) => {
    loading.value = true;
    user.value = newUser;
    
    if (newUser) {
      await checkAdminStatus(newUser.uid);
    } else {
      isAdmin.value = false;
    }
    
    loading.value = false;
  });

  // Register new user
  const register = async (email, password) => {
    try {
      error.value = null;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        isAdmin: false,
        email: email,
        createdAt: new Date()
      });

      return userCredential.user;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      error.value = null;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await checkAdminStatus(userCredential.user.uid);
      return userCredential.user;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      error.value = null;
      await signOut(auth);
      isAdmin.value = false;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  };

  // Make user admin (should only be called by existing admins)
  const makeUserAdmin = async (email) => {
    try {
      if (!isAdmin.value) {
        throw new Error('Only admins can make other users admin');
      }

      // Get all users
      const usersRef = collection(db, 'users');
      const userDocs = await getDocs(usersRef);
      
      // Find user by email
      let targetUserId = null;
      userDocs.forEach(doc => {
        if (doc.data().email === email) {
          targetUserId = doc.id;
        }
      });

      if (!targetUserId) {
        throw new Error('User not found');
      }

      // Update user to admin
      await setDoc(doc(db, 'users', targetUserId), {
        isAdmin: true
      }, { merge: true });

      return { success: true, message: `${email} is now an admin` };
    } catch (e) {
      console.error('Error making user admin:', e);
      throw e;
    }
  };

  return {
    user,
    loading,
    error,
    isAdmin,
    register,
    login,
    logout,
    makeUserAdmin
  };
});
