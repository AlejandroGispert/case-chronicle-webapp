import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Mail, FolderLock, Users } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top navigation — sidebar blue (223 47% 55%) */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <Link
            to="/"
            className="flex items-center gap-2 font-serif font-bold text-lg text-sidebar-primary hover:text-sidebar-primary/90"
          >
            <FileText className="h-5 w-5" aria-hidden />
            Case Chronicle
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild size="sm" className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground border-0">
              <Link to="/login">Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {/* Hero — dark bg, white text, sidebar blue CTA */}
        <section
          className="relative w-full px-4 sm:px-6 py-16 sm:py-24 text-center min-h-[420px] sm:min-h-[480px] flex flex-col items-center justify-center"
          style={{
            backgroundImage: "url(/landing-bg.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-black/50" aria-hidden />
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-4">
              Case Chronicle
            </h1>
            <p className="text-xl text-white/95 mb-2 max-w-2xl mx-auto">
              Case management platform
            </p>
            <p className="text-white/80 mb-10 max-w-xl mx-auto text-sm sm:text-base">
              Organize cases, track emails and events, and keep everything in
              one place. Simple, private, and built for individuals and small
              teams, with strong GDPR compliance focus.
            </p>
            <Button asChild size="lg" className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground border-0">
              <Link to="/login">Get started — Sign in</Link>
            </Button>
          </div>
        </section>

        {/* Features — muted section, cards, sidebar blue accents */}
        <section className="border-t bg-muted/30 px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-serif font-semibold text-foreground text-center mb-10">
              What you can do
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary/15 text-sidebar-primary">
                  <FolderLock className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-foreground mb-1">Cases</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage cases with titles, clients, and status.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary/15 text-sidebar-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-foreground mb-1">Emails</h3>
                <p className="text-sm text-muted-foreground">
                  Attach emails to cases and view them in a unified timeline.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary/15 text-sidebar-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-foreground mb-1">Events</h3>
                <p className="text-sm text-muted-foreground">
                  Add deadlines and events per case and see them on a calendar.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary/15 text-sidebar-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-foreground mb-1">Share</h3>
                <p className="text-sm text-muted-foreground">
                  Invite others to view or edit a case with controlled access.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA — sidebar blue outline */}
        <section className="px-4 sm:px-6 py-16 sm:py-20 text-center border-t">
          <p className="text-muted-foreground mb-4">
            Ready to organize your cases?
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-sidebar-primary/50 text-sidebar-primary hover:bg-sidebar-primary/10 hover:border-sidebar-primary"
          >
            <Link to="/login">Sign in or create an account</Link>
          </Button>
        </section>
      </main>
    </div>
  );
};

export default Landing;
