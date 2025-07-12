
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

// This file is now simplified to just provide the types and a constructor.
// The actual initialization is handled in the TimerContext to ensure it only runs on the client.

export type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Database;
};

let firebaseServices: FirebaseServices | null = null;

export const getFirebaseServices = (): FirebaseServices => {
  if (firebaseServices) {
    return firebaseServices;
  }
  
  // This check ensures this code only runs on the client
  if (typeof window === "undefined") {
    // On the server, return a dummy object or throw an error
    // Returning null/dummy is safer for preventing server-side crashes.
    throw new Error("Firebase services can only be initialized on the client side.");
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

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.databaseURL) {
    throw new Error("Firebase configuration is missing or invalid. Please check your .env.local file and ensure all NEXT_PUBLIC_ variables are set.");
  }

  let app: FirebaseApp;
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  const auth = getAuth(app);
  const db = getDatabase(app);

  firebaseServices = { app, auth, db };

  return firebaseServices;
};
