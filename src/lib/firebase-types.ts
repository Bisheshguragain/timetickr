
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Database } from "firebase/database";

export type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Database;
};
