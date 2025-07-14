
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTimer } from "@/context/TimerContext";
import { Loader } from "lucide-react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, loadingAuth } = useTimer();
  const router = useRouter();

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push("/login");
    }
  }, [loadingAuth, currentUser, router]);

  if (loadingAuth || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
