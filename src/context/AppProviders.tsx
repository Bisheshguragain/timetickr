
"use client";

import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the providers that rely on client-side logic
const ClientProviders = dynamic(() => import('./ClientProviders').then(mod => mod.ClientProviders), {
  ssr: false,
  // Render a loading skeleton to prevent layout shift and maintain SSR compatibility
  loading: () => (
    <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b h-16" />
        <main className="flex-1 p-4 md:p-6">
            <div className="mb-8 flex items-center justify-between">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
                <div className="space-y-8 lg:col-span-1">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </main>
    </div>
  )
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
        <ClientProviders>
          {children}
        </ClientProviders>
        <Toaster />
    </ThemeProvider>
  );
}
