// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, Auth } from "firebase/auth";

// This object will hold the initialized Firebase services to ensure it's a singleton.
let firebaseInstances: { app: FirebaseApp; auth: Auth; db: Database } | null = null;

// This function provides a single point of entry for getting Firebase instances.
// It ensures that Firebase is initialized only once and only on the client-side.
export function getFirebaseInstances() {
  if (typeof window === "undefined") {
    // This function should not be called on the server.
    // If it is, it's a bug in the calling code.
    return null;
  }

  // If we already have instances, return them
  if (firebaseInstances) {
    return firebaseInstances;
  }

  // Define the config object directly inside the function
  // to ensure env vars are read on the client.
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  
  // Check if all required environment variables are present.
  if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL || !firebaseConfig.projectId) {
     console.error("Firebase configuration is missing or invalid. Check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_ variables are set.");
     return null;
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getDatabase(app);

    firebaseInstances = { app, auth, db };
    return firebaseInstances;
  } catch (error: any) {
    console.error("Firebase initialization error:", error.message);
    return null;
  }
}
