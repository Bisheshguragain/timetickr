
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// =================================================================================
// TODO: PASTE YOUR FIREBASE CONFIGURATION HERE
// =================================================================================
// You can get this from the Firebase console:
// 1. Go to your project's settings.
// 2. In the "General" tab, scroll down to "Your apps".
// 3. Select the web app and copy the config object.
//
// The auth/api-key-not-valid error occurs because these values are placeholders.
// You MUST replace them with your actual project credentials to fix the error.
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };
