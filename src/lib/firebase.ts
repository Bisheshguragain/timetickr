
// This file is a central place to initialize Firebase and export services.
// This ensures Firebase is initialized only once in the entire application.

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import type { FirebaseServices } from './firebase-types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // The Realtime Database SDK expects the ".firebaseio.com" URL format.
  // Using the newer ".firebasedatabase.app" URL causes a fatal parsing error.
  databaseURL: "https://timetickr-landing-page-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp;
let auth: Auth;
let db: Database;
let services: FirebaseServices;

// Initialize Firebase only if it hasn't been initialized yet.
// This is safe to run on both server and client, and ensures a singleton instance.
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

auth = getAuth(app);
db = getDatabase(app);

services = { app, auth, db };

export { services, app, auth, db };
