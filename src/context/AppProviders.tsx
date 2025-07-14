
"use client";

import { ThemeProvider } from '@/context/ThemeContext';
import { TeamProvider } from '@/context/TeamContext';
import { TimerProvider } from '@/context/TimerContext';
import { Toaster } from '@/components/ui/toaster';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TeamProvider>
        <TimerProvider>
          {children}
          <Toaster />
        </TimerProvider>
      </TeamProvider>
    </ThemeProvider>
  );
}
