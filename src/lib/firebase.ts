
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1Att5fmS7zFa_X9-hczg-YhhLAoWimUU",
  authDomain: "timetickr-landing-page.firebaseapp.com",
  databaseURL: "https://timetickr-landing-page-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "timetickr-landing-page",
  storageBucket: "timetickr-landing-page.appspot.com",
  messagingSenderId: "62667221490",
  appId: "1:62667221490:web:f9927e4b63dc50a52be36b"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };
