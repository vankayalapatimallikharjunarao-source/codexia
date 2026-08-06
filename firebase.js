import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ============================================================================
// FIREBASE WEB APP CONFIGURATION
// ----------------------------------------------------------------------------
// Paste your Firebase Web App configuration object below if using a custom project:
// ============================================================================
// User Custom Firebase Configuration
const userFirebaseConfig = {
  apiKey: "AIzaSyAEMBqOaUo-Hb5glIKv9CyxFqv6Yb16LPg",
  authDomain: "codexia-web.firebaseapp.com",
  projectId: "codexia-web",
  storageBucket: "codexia-web.firebasestorage.app",
  messagingSenderId: "235162700852",
  appId: "1:235162700852:web:91560af2691ac52e188e61"
};

// Default configuration loaded from local environment or configuration manifest
import firebaseConfigManifest from "./firebase-applet-config.json" with { type: "json" };

const firebaseConfig = {
  apiKey: userFirebaseConfig.apiKey || import.meta.env?.VITE_FIREBASE_API_KEY || firebaseConfigManifest.apiKey,
  authDomain: userFirebaseConfig.authDomain || import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigManifest.authDomain,
  projectId: userFirebaseConfig.projectId || import.meta.env?.VITE_FIREBASE_PROJECT_ID || firebaseConfigManifest.projectId,
  storageBucket: userFirebaseConfig.storageBucket || import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigManifest.storageBucket,
  messagingSenderId: userFirebaseConfig.messagingSenderId || import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigManifest.messagingSenderId,
  appId: userFirebaseConfig.appId || import.meta.env?.VITE_FIREBASE_APP_ID || firebaseConfigManifest.appId,
};

// Initialize Firebase App instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth & Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfigManifest.firestoreDatabaseId || undefined);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account"
});

// Authentication Helper Functions
export const signInWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const loginWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signupWithEmail = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const resetPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};

export const logoutUser = async () => {
  return await signOut(auth);
};

export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Human-readable error message mapper
export const getAuthErrorMessage = (error) => {
  if (!error) return "An unknown authentication error occurred.";
  const code = error.code || "";
  
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email address or password. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please sign in instead.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/too-many-requests":
      return "Too many failed login attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network connection error. Please check your internet connection.";
    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed before completing.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
    default:
      return error.message || "Authentication failed. Please try again.";
  }
};

export default app;
