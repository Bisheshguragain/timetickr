
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useState, useEffect } from "react";


export function PrivacyPolicyDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    // This ensures the date is only rendered on the client, avoiding hydration mismatch.
    setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>
            Last Updated: {lastUpdated}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Welcome to TimeTickR. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
            </p>
            <h3 className="font-semibold text-foreground">1. Information We Collect</h3>
            <p>
              We may collect information about you in a variety of ways. The information we may collect via the Application includes:
              <br />
              - <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, that you voluntarily give to us when you register with the Application.
              <br />
              - <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Application, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Application.
              <br />
              - <strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g. valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Application. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor, Stripe.
            </p>
            <h3 className="font-semibold text-foreground">2. Use of Your Information</h3>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
              <br />
              - Create and manage your account.
              <br />
              - Process your payments and refunds.
              <br />
              - Email you regarding your account or order.
              <br />
              - Monitor and analyze usage and trends to improve your experience with the Application.
            </p>
            <h3 className="font-semibold text-foreground">3. Disclosure of Your Information</h3>
            <p>
              We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
              <br />
              - <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
              <br />
              - <strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
            </p>
             <h3 className="font-semibold text-foreground">4. Security of Your Information</h3>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
            <h3 className="font-semibold text-foreground">5. Contact Us</h3>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us using the contact form on our website.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
