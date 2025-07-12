// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

let app, db, auth;

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const requiredEnv = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_DATABASE_URL',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

// This check will only run on the client side, preventing server build errors.
if (typeof window !== 'undefined') {
    const missingEnv = requiredEnv.filter(key => !(process.env as any)[key]);

    if (missingEnv.length > 0) {
        // This will log a warning in the browser console if keys are missing
        console.warn(`FIREBASE WARNING: Missing environment variables: ${missingEnv.join(', ')}. Please set them in your .env.local file.`);
        // Set to null to prevent further errors
        app = null;
        db = null;
        auth = null;
    } else {
        try {
            // Initialize Firebase
            app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
            db = getDatabase(app);
            auth = getAuth(app);
        } catch (error: any) {
            console.error("Firebase initialization error:", error.message);
            // Setting these to null so the app doesn't crash, but functions will fail gracefully.
            app = null;
            db = null;
            auth = null;
        }
    }
}


export { db, auth, app };
