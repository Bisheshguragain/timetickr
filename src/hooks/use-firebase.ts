
"use client";

import { useState, useEffect } from "react";
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import type { FirebaseServices } from "@/lib/firebase-types";

export function useFirebase() {
  const [services, setServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // This effect runs only once on the client-side after mount
    if (typeof window !== "undefined" && !getApps().length) {
      // Hardcode the Firebase config object using the values provided.
      // This bypasses any issues with environment variable loading.
      const firebaseConfig = {
        apiKey: "AIzaSyB1Att5fmS7zFa_X9-hczg-YhhLAoWimUU",
        authDomain: "timetickr-landing-page.firebaseapp.com",
        // The RTDB SDK sometimes requires the .firebaseio.com URL format.
        // We construct it from the projectId to be safe.
        databaseURL: "https://timetickr-landing-page.firebaseio.com",
        projectId: "timetickr-landing-page",
        storageBucket: "timetickr-landing-page.appspot.com",
        messagingSenderId: "62667221490",
        appId: "1:62667221490:web:f9927e4b63dc50a52be36b"
      };

      if (!firebaseConfig.apiKey) {
        console.error("Firebase config is missing API key.");
        return;
      }

      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getDatabase(app);
      
      setServices({ app, auth, db });
    } else if (getApps().length) {
      const app = getApp();
      const auth = getAuth(app);
      const db = getDatabase(app);
      setServices({ app, auth, db });
    }
  }, []);

  return services;
}
