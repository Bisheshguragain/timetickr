
// This file is a central place to initialize Firebase and export services.
// This ensures Firebase is initialized only once in the entire application.

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import type { FirebaseServices } from './firebase-types';

// --- IMPORTANT ---
// These environment variables must be defined in your .env.local file.
// See the project README for more details.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check if all required environment variables are set.
if (!firebaseConfig.apiKey) {
    throw new Error("Firebase configuration is not complete. Please create a .env.local file and add all the required NEXT_PUBLIC_FIREBASE_... variables.");
}

let app: FirebaseApp;

// Initialize Firebase only if it hasn't been initialized yet.
// This is safe to run on both server and client, and ensures a singleton instance.
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };
