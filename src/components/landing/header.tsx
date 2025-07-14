
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, TimerIcon, LogOut } from "lucide-react";
import { useTimer } from "@/context/TimerContext";

export function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { currentUser, loadingAuth, logout } = useTimer();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <TimerIcon className="h-7 w-7 text-primary" />
            <span className="font-headline text-2xl">TimeTickR</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-6 text-sm md:flex">
            {navLinks.map((link) => (
                <Link
                key={link.href}
                href={link.href}
                className="font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                >
                {link.label}
                </Link>
            ))}
            </nav>
            <div className="flex items-center gap-4">
            
            {isClient && !loadingAuth && (
              <>
                {currentUser ? (
                  <>
                    <Button variant="secondary" size="sm" asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={logout} title="Sign Out">
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-foreground/60">
                    <Link href="/login">Login</Link>
                  </Button>
                )}
              </>
            )}

            <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    className="px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0">
                <Link href="/" className="flex items-center gap-2 font-bold" onClick={() => setMenuOpen(false)}>
                    <TimerIcon className="h-6 w-6 text-primary" />
                    <span className="font-headline text-xl">TimeTickR</span>
                </Link>
                <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                    <div className="flex flex-col space-y-3">
                    {navLinks.map((link) => (
                        <Link
                        key={link.href}
                        href={link.href}
                        className="text-foreground"
                        onClick={() => setMenuOpen(false)}
                        >
                        {link.label}
                        </Link>
                    ))}
                     {isClient && !loadingAuth && (
                      <>
                        {currentUser ? (
                          <Link href="/dashboard" className="text-foreground" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                        ) : (
                          <Link href="/login" className="text-foreground" onClick={() => setMenuOpen(false)}>Login</Link>
                        )}
                      </>
                    )}
                    </div>
                </div>
                </SheetContent>
            </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
