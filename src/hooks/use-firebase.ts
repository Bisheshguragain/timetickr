
"use client";

import { useState, useEffect } from "react";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";
import { FirebaseServices } from "@/lib/firebase";

// This hook is designed to initialize Firebase on the client-side only.
export function useFirebase() {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure this code only runs in the browser
    if (typeof window !== "undefined") {
      
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        // Construct the correct databaseURL format as per Firebase requirements for RTDB SDK
        databaseURL: projectId ? `https://${projectId}.firebaseio.com` : undefined,
        projectId: projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      try {
        if (firebaseConfig.apiKey && firebaseConfig.databaseURL && firebaseConfig.projectId) {
          const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
          const auth = getAuth(app);
          const db = getDatabase(app);
          setServices({ app, auth, db });
        } else {
          console.error("Firebase configuration is missing or invalid. Check your .env.local file. Required: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID");
        }
      } catch (error) {
        console.error("Firebase initialization error:", error);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  return { services, loading };
}
