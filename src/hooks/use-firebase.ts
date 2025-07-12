
"use client";

import { services } from "@/lib/firebase";
import type { FirebaseServices } from "@/lib/firebase-types";

// This hook is now a simple wrapper around the singleton instance.
// Its primary purpose is to conform to the "use" hook naming convention
// for client components that might need direct access to Firebase services,
// even though most will get it from TimerContext.
export function useFirebase(): FirebaseServices {
  return services;
}
