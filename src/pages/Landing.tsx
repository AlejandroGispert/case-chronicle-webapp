import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Calendar,
  Mail,
  FolderLock,
  Users,
  ChevronDown,
} from "lucide-react";

type HeroVariant = "individuals" | "teams" | "business";

const HERO_CONTENT: Record<
  HeroVariant,
  { title: string; subtitle: string; description: string; bgImage: string }
> = {
  individuals: {
    title: "Case Chronicle",
    subtitle: "Case management platform",
    description:
      "Organize cases, track emails and events, and keep everything in one place. Simple, private, and built for individuals and small teams, with strong GDPR compliance focus.",
    bgImage: "/images/landing-individuals.png",
  },
  teams: {
    title: "Case Chronicle",
    subtitle: "For teams",
    description:
      "Share cases with your team. Control view or edit access per case. Organize cases, emails, and events in one place. Simple, private collaboration with strong GDPR compliance.",
    bgImage: "/images/landing-bg.png",
  },
  business: {
    title: "Case Chronicle",
    subtitle: "For business",
    description:
      "Case management for organizations. Teams, billing, and controlled access. Organize cases, emails, and events in one place. Privacy and GDPR compliance built in.",
    bgImage: "/images/landing-business.png",
  },
};

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [heroVariant, setHeroVariant] = useState<HeroVariant>("individuals");

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
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 font-serif font-bold text-lg text-sidebar-primary hover:text-sidebar-primary/90"
            >
              <FileText className="h-5 w-5" aria-hidden />
              Case Chronicle
            </Link>
            <nav className="flex items-center gap-2 sm:gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="default"
                    className="gap-1 text-foreground hover:!text-sidebar-primary focus:!text-sidebar-primary data-[state=open]:!text-sidebar-primary"
                  >
                    Products
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setHeroVariant("individuals");
                    }}
                    className="cursor-pointer"
                  >
                    For individuals
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setHeroVariant("business");
                    }}
                    className="cursor-pointer"
                  >
                    For business
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                asChild
                size="default"
                variant="outline"
                className="gap-1 border-black text-foreground hover:!text-sidebar-primary hover:bg-sidebar-primary/10 hover:border-sidebar-primary"
              >
                <Link to="/plans">Buy Case Chronicle</Link>
              </Button>
            </nav>
          </div>
          <Button asChild variant="ghost" size="default">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {/* Hero — dark bg, white text, sidebar blue CTA; content and bg per product */}
        <section
          className="relative w-full px-4 sm:px-6 py-16 sm:py-24 text-center min-h-[420px] sm:min-h-[480px] flex flex-col items-center justify-center"
          style={{
            backgroundImage: `url(${HERO_CONTENT[heroVariant].bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-black/50" aria-hidden />
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-4">
              {HERO_CONTENT[heroVariant].title}
            </h1>
            <p className="text-xl text-white/95 mb-2 max-w-2xl mx-auto">
              {HERO_CONTENT[heroVariant].subtitle}
            </p>
            <p className="text-white/80 mb-10 max-w-xl mx-auto text-sm sm:text-base">
              {HERO_CONTENT[heroVariant].description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground border-0"
              >
                <Link to="/login">Get started</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/50 bg-transparent !text-white hover:bg-white/10 hover:border-white hover:!text-white"
              >
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Who it's for — audience segmentation */}

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
            className="border-sidebar-primary/50 bg-background text-sidebar-primary hover:bg-sidebar-primary/10 hover:border-sidebar-primary hover:text-sidebar-primary"
          >
            <Link to="/login">Sign in or create an account</Link>
          </Button>
        </section>
      </main>

      {/* Footer — company, legal links */}
      <footer className="border-t bg-muted/30 px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="text-center sm:text-left">
            <p>
              © 2026 Case Chronicle – AG sound Denmark. All rights reserved.
            </p>
            <p className="mt-1">CVR: 44789418</p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            <Link
              to="/terms"
              className="hover:text-foreground underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="hover:text-foreground underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
