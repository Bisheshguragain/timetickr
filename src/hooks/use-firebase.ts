
"use client";

import { useState, useEffect } from "react";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";
import { FirebaseServices } from "@/lib/firebase";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function useFirebase() {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (firebaseConfig.apiKey && firebaseConfig.databaseURL) {
        let app: FirebaseApp;
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApp();
        }

        const auth = getAuth(app);
        const db = getDatabase(app);
        
        setServices({ app, auth, db });
      } else {
         console.error("Firebase configuration is missing or invalid. Check your .env.local file.");
      }
    } catch (error) {
        console.error("Firebase initialization error:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  return { services, loading };
}
