import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

const PrivacyPolicy = () => {
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
        <h1 className="text-3xl font-serif font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Last updated: February 2026
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Data controller</h2>
            <p>
              AG sound Denmark (CVR: 44789418) (“we”) operates Case Chronicle and
              is the data controller for the personal data processed through the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. What we collect</h2>
            <p>
              We collect and process data necessary to provide the Service:
              account information (e.g. email), case and collaboration data you
              create, and technical data (e.g. IP address, logs) for security and
              operation. We do not sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Legal basis and purpose</h2>
            <p>
              We process your data on the basis of contract (providing the
              Service), legitimate interest (security, abuse prevention), and
              where applicable your consent. Data is used to operate, secure, and
              improve the Service and to comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Your rights (GDPR)</h2>
            <p>
              You have the right to access, rectify, erase, restrict processing,
              data portability, and to object. You may request a data export
              (Art. 20) or deletion. Contact us using the details in the Service
              or at our registered address. You may also lodge a complaint with
              a supervisory authority.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Retention and security</h2>
            <p>
              We retain data as long as your account is active and as required
              by law. We apply appropriate technical and organisational measures
              to protect your data. Sensitive actions are audit-logged without
              storing PII in logs.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Contact</h2>
            <p>
              For privacy-related requests or questions, contact AG sound
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

export default PrivacyPolicy;
