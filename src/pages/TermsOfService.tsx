import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <Link
            to="/"
            className="flex items-center gap-2 font-serif font-bold text-lg text-sidebar-primary hover:text-sidebar-primary/90"
          >
            <FileText className="h-5 w-5" aria-hidden />
            Case Chronicle
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-12 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-serif font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Last updated: February 2026
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Agreement</h2>
            <p>
              By using Case Chronicle (“the Service”), operated by AG sound Denmark
              (CVR: 44789418), you agree to these Terms of Service. If you do not
              agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Use of the Service</h2>
            <p>
              You must use the Service in compliance with applicable laws and
              these terms. You are responsible for the content you store and
              share through the Service and for keeping your account secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Account and Data</h2>
            <p>
              We process your data as described in our{" "}
              <Link to="/privacy" className="text-sidebar-primary hover:underline">
                Privacy Policy
              </Link>
              . You may request data export or deletion in accordance with
              applicable data protection law (e.g. GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Limitation of Liability</h2>
            <p>
              The Service is provided “as is.” To the extent permitted by law,
              AG sound Denmark shall not be liable for indirect, incidental, or
              consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Contact</h2>
            <p>
              For questions about these Terms of Service, contact AG sound
              Denmark using the contact details provided on the Service or at
              the company’s registered address.
            </p>
          </section>
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          © 2026 Case Chronicle – AG sound Denmark. All rights reserved. CVR: 44789418.
        </p>
      </main>
    </div>
  );
};

export default TermsOfService;
