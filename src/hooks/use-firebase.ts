
"use client";

import { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import type { FirebaseServices } from "@/lib/firebase-types";

export function useFirebase() {
  const [services, setServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // This effect runs only once on the client-side after mount
    if (typeof window !== "undefined") {
      const app = !getApps().length
        ? initializeApp({
            apiKey: "AIzaSyB1Att5fmS7zFa_X9-hczg-YhhLAoWimUU",
            authDomain: "timetickr-landing-page.firebaseapp.com",
            databaseURL: "https://timetickr-landing-page.firebaseio.com",
            projectId: "timetickr-landing-page",
            storageBucket: "timetickr-landing-page.appspot.com",
            messagingSenderId: "62667221490",
            appId: "1:62667221490:web:f9927e4b63dc50a52be36b"
        })
        : getApp();

      const auth = getAuth(app);
      const db = getDatabase(app);
      
      setServices({ app, auth, db });
    }
  }, []);

  return services;
}
