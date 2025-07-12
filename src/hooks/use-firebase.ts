
"use client";

// This hook is no longer needed for initialization as it's handled in `src/lib/firebase.ts`.
// It can be kept for other client-side Firebase logic or removed if unused.
// For now, we'll keep a placeholder to avoid breaking imports that might still exist.

import { services } from "@/lib/firebase";
import type { FirebaseServices } from "@/lib/firebase-types";

export function useFirebase(): FirebaseServices | null {
  // The services are now initialized synchronously in a central file,
  // so we can just return them. The hook remains for component-level access
  // if needed, but the core initialization is done elsewhere.
  return services;
}
