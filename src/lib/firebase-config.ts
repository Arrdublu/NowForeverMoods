// For non-sensitive fallback in the preview/dev environment
const FALLBACK_PROJECT_ID = "nowforevermoods";
const FALLBACK_DATABASE_ID = "ai-studio-063bf61f-9e09-4aac-81b9-b914752a6909";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDFd9klB4pIhRj7S7dMaFDbD9al1ezMyyE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${FALLBACK_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || FALLBACK_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${FALLBACK_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "36897396429",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:36897396429:web:016dd6950b474ebf99fb84",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

export const firestoreDatabaseId = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID || FALLBACK_DATABASE_ID;
