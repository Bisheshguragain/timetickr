
"use client";

import { TimerIcon } from "lucide-react";
import React, { useState } from "react";
import { TermsOfServiceDialog } from "../legal/TermsOfServiceDialog";
import { PrivacyPolicyDialog } from "../legal/PrivacyPolicyDialog";
import { Button } from "../ui/button";

export function Footer() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="border-t bg-secondary/50">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <TimerIcon className="h-5 w-5 text-primary" />
              <span className="font-headline text-lg font-bold">TimeTickR</span>
            </div>
            <p className="text-sm text-foreground/60">
              © {new Date().getFullYear()} TimeTickR, Inc. All rights reserved.
            </p>
            <nav className="flex gap-4">
              <Button
                variant="link"
                onClick={() => setIsTermsOpen(true)}
                className="text-sm text-foreground/60 transition-colors hover:text-foreground px-0"
              >
                Terms of Service
              </Button>
              <Button
                variant="link"
                onClick={() => setIsPrivacyOpen(true)}
                className="text-sm text-foreground/60 transition-colors hover:text-foreground px-0"
              >
                Privacy Policy
              </Button>
            </nav>
          </div>
        </div>
      </footer>
      <TermsOfServiceDialog open={isTermsOpen} onOpenChange={setIsTermsOpen} />
      <PrivacyPolicyDialog open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen} />
    </>
  );
}
