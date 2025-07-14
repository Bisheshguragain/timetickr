"use client";

import { useTimer } from "@/context/TimerContext";
import { useEffect, useState } from "react";
import { getIdTokenResult, type User } from "firebase/auth";

export function useAuth() {
  const { currentUser, loadingAuth } = useTimer();
  const [token, setToken] = useState<string | null>(null);
  const [claims, setClaims] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setToken(null);
      setClaims(null);
      return;
    }

    const fetchToken = async (user: User) => {
      try {
        const tokenResult = await getIdTokenResult(user);
        setToken(tokenResult.token);
        setClaims(tokenResult.claims);
      } catch (error) {
        console.error("Error fetching ID token:", error);
        setToken(null);
        setClaims(null);
      }
    };

    fetchToken(currentUser);
  }, [currentUser]);

  return {
    isAuthenticated: !!currentUser,
    isLoading: loadingAuth,
    user: currentUser,
    token,
    claims,
  };
}
