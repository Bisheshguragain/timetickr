
"use client";

import { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import type { FirebaseServices } from "@/lib/firebase";
import { firebaseConfig } from "@/lib/firebase-config";

// This hook is designed to initialize Firebase on the client-side only.
export function useFirebase() {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs only once on the client after the component mounts.
    
    // Check if all required config keys are present.
    if (
      firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.databaseURL
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
