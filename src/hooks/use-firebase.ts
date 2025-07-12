
"use client";

import { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import type { FirebaseServices } from "@/lib/firebase";

// This hook is designed to initialize Firebase on the client-side only.
export function useFirebase() {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs only once on the client after the component mounts.
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      // The Realtime Database SDK requires the classic '.firebaseio.com' URL format.
      databaseURL: `https://` + process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID + `.firebaseio.com`,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    
    // Check if all required config keys are present.
    if (
      firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.databaseURL &&
      !firebaseConfig.databaseURL.includes('undefined')
    ) {
      try {
        // Initialize Firebase. This is safe to call multiple times as getApps() prevents re-initialization.
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        const auth = getAuth(app);
        const db = getDatabase(app);
        
        setServices({ app, auth, db });

      } catch (error) {
        console.error("Firebase initialization error:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // If config is missing, log an error and stop loading.
      console.error(
        "Firebase configuration is missing or invalid. Please check your .env.local file."
      );
      setLoading(false);
    }
  }, []); // Empty dependency array ensures this runs only once on mount.

  return { services, loading };
}
