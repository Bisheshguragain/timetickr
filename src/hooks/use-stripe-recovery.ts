
"use client";

import { useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { useTimer } from "@/context/TimerContext";
import { useToast } from "@/hooks/use-toast";

export function useStripeRecovery() {
  const { currentUser, plan, setPlan } = useTimer();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!currentUser) return;

    const paymentSuccess = searchParams.get('payment_success');
    const paymentCanceled = searchParams.get('payment_canceled');

    if (paymentSuccess) {
      toast({
        variant: "default",
        title: "Payment Successful!",
        description: `Your plan has been updated. Welcome to the ${plan} tier!`,
        duration: 5000,
      });
    }

    if (paymentCanceled) {
      toast({
        variant: "destructive",
        title: "Payment Canceled",
        description: "Your payment process was canceled. Your plan has not been changed.",
        duration: 5000,
      });
    }

    // Clean the URL to prevent the toast from showing up on every refresh
    if (paymentSuccess || paymentCanceled) {
        const newPath = window.location.pathname;
        window.history.replaceState({}, document.title, newPath);
    }
  }, [currentUser, plan, searchParams, toast]);
}
