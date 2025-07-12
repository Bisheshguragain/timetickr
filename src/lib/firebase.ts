
// This file is a central place to initialize Firebase and export services.
// This ensures Firebase is initialized only once in the entire application.

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import type { FirebaseServices } from './firebase-types';

const firebaseConfig = {
  apiKey: "AIzaSyB1Att5fmS7zFa_X9-hczg-YhhLAoWimUU",
  authDomain: "timetickr-landing-page.firebaseapp.com",
  // IMPORTANT: Use the .firebaseio.com domain for Realtime Database SDK
  databaseURL: "https://timetickr-landing-page.firebaseio.com",
  projectId: "timetickr-landing-page",
  storageBucket: "timetickr-landing-page.appspot.com",
  messagingSenderId: "62667221490",
  appId: "1:62667221490:web:f9927e4b63dc50a52be36b"
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
