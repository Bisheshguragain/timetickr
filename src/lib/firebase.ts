// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, Auth } from "firebase/auth";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;

// This function takes a config object and initializes Firebase, but only once.
function getFirebaseInstances(firebaseConfig: object) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getDatabase(app);
    } catch (error: any) {
        console.error("Firebase initialization error:", error.message);
        // Set to null if initialization fails
        app = null;
        auth = null;
        db = null;
    }
  } else {
    app = getApp();
    auth = getAuth(app);
    db = getDatabase(app);
  }
  return { app, auth, db };
}

export { getFirebaseInstances };
