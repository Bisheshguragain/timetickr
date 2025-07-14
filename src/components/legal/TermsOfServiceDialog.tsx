
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

export function TermsOfServiceDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              These Terms of Service ("Terms") govern your access to and use of TimeTickR’s websites, mobile applications, and services (collectively, the "Services"). Please read these Terms carefully, and contact us if you have any questions. By accessing or using our Services, you agree to be bound by these Terms and by our Privacy Policy.
            </p>
            <h3 className="font-semibold text-foreground">1. Using TimeTickR</h3>
            <p>
              You may use our Services only if you can form a binding contract with TimeTickR, and only in compliance with these Terms and all applicable laws. When you create your TimeTickR account, you must provide us with accurate and complete information. Any use or access by anyone under the age of 13 is prohibited.
            </p>
            <h3 className="font-semibold text-foreground">2. Your Content</h3>
            <p>
              You retain all rights in, and are solely responsible for, the content you post to TimeTickR. You grant TimeTickR and our users a non-exclusive, royalty-free, transferable, sublicensable, worldwide license to use, store, display, reproduce, modify, create derivative works, perform, and distribute your content on TimeTickR solely for the purposes of operating, developing, providing, and using the Services.
            </p>
            <h3 className="font-semibold text-foreground">3. Subscription and Billing</h3>
            <p>
              Certain aspects of the Services may be provided for a fee or other charge. If you elect to use paid aspects of the Services, you agree to the pricing and payment terms, as we may update them from time to time. TimeTickR may add new services for additional fees and charges, or amend fees and charges for existing services, at any time in its sole discretion.
            </p>
            <h3 className="font-semibold text-foreground">4. Termination</h3>
            <p>
              TimeTickR may terminate or suspend your right to access or use our Services for any reason on appropriate notice. We may terminate or suspend your access immediately and without notice if we have a good reason, including any violation of our policies.
            </p>
             <h3 className="font-semibold text-foreground">5. Disclaimers</h3>
            <p>
              The Services and all included content are provided on an "as is" basis without warranty of any kind, whether express or implied.
            </p>
            <h3 className="font-semibold text-foreground">6. Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TIMETICKR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
