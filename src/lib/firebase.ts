// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, Auth } from "firebase/auth";

// This object will hold the initialized Firebase services.
let firebaseInstances: { app: FirebaseApp; auth: Auth; db: Database } | null = null;

// This function provides a single point of entry for getting Firebase instances.
// It ensures that Firebase is initialized only once.
export function getFirebaseInstances() {
  if (firebaseInstances) {
    return firebaseInstances;
  }

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
  // This is the most critical check to prevent the "Cannot parse Firebase url" error.
  if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL || !firebaseConfig.projectId) {
    const missingKeys = Object.entries(firebaseConfig)
      .filter(([, value]) => !value)
      .map(([key]) => `NEXT_PUBLIC_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
    
    console.error(`Firebase initialization failed: Missing required environment variables: ${missingKeys.join(', ')}. Please check your .env.local file.`);
    
    // Throw an error to halt execution if config is invalid.
    throw new Error("Firebase configuration is missing or invalid.");
  }

  let app: FirebaseApp;
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  const auth = getAuth(app);
  const db = getDatabase(app);

  firebaseInstances = { app, auth, db };
  return firebaseInstances;
}
