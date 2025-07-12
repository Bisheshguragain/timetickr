import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Database } from "firebase/database";

// This file is now simplified to just provide the types.
// The actual initialization is handled in the TimerContext to ensure it only runs on the client.

export type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Database;
};
