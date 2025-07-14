// This file is for the Firebase Admin SDK, for use in secure backend environments.
// IMPORTANT: Do not expose this to the client-side. The service account credentials
// must be kept secret.

import { initializeApp, getApps, getApp, type App, cert } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getDatabase, type Database } from 'firebase-admin/database';

// Load the service account key from environment variables.
// In Firebase App Hosting, these can be set as secrets.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

let app: App;
let auth: Auth;
let db: Database;

if (serviceAccount) {
    if (!getApps().length) {
        app = initializeApp({
            credential: cert(serviceAccount),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        });
    } else {
        app = getApp();
    }
    
    auth = getAuth(app);
    db = getDatabase(app);

} else {
    console.warn(
    'Firebase Admin SDK not initialized. FIREBASE_SERVICE_ACCOUNT_KEY is not set.'
  );
  // Assign dummy objects if not initialized to prevent runtime errors on import.
  // @ts-ignore
  app = {};
  // @ts-ignore
  auth = {};
  // @ts-ignore
  db = {};
}

export { app as adminApp, auth as adminAuth, db as adminDb };
