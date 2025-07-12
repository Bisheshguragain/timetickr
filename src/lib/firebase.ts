
"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

// Your web app's Firebase configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyB1Att5fmS7zFa_X9-hczg-YhhLAoWimUU",
  authDomain: "timetickr-landing-page.firebaseapp.com",
  databaseURL: "https://timetickr-landing-page-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "timetickr-landing-page",
  storageBucket: "timetickr-landing-page.appspot.com",
  messagingSenderId: "62667221490",
  appId: "1:62667221490:web:f9927e4b63dc50a52be36b"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth: Auth = getAuth(app);
const db: Database = getDatabase(app);

export { app, auth, db };
export type { FirebaseServices } from './firebase-types';
