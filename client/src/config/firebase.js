import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5n2X6bYHgB1-SauA6El0w_d6S7KZJaiU",
  authDomain: "lod-lavki-project.firebaseapp.com",
  projectId: "lod-lavki-project",
  storageBucket: "lod-lavki-project.firebasestorage.app",
  messagingSenderId: "707497556595",
  appId: "1:707497556595:web:e90233119937a80023c806",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
