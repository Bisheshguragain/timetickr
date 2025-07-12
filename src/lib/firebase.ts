// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp;
let auth: Auth;
let db: Database;

try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getDatabase(app);
} catch (error: any) {
    console.error("Firebase initialization error:", error.message);
    // Provide non-functional dummies to prevent app from crashing on import
    app = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as Database;
}

export { db, auth, app };
