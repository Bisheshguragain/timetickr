// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Database;

// This function ensures Firebase is initialized only once
function getFirebaseInstances() {
  if (!getApps().length) {
    if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
      throw new Error("Firebase config variables are missing. Please check your .env.local file.");
    }
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getDatabase(app);
  } else {
    app = getApp();
    auth = getAuth(app);
    db = getDatabase(app);
  }
  return { app, auth, db };
}

// Export the function to be used throughout the app
export { getFirebaseInstances };
