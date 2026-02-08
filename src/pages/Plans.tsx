import { Link } from "react-router-dom";
import { FileText, User, Users, Building2, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Plans = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
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
                    className="gap-1 text-foreground hover:text-sidebar-primary"
                  >
                    Products
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/plans#individual">For individuals</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/plans#teams">For teams</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/plans#business">For business</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                asChild
                size="default"
                variant="outline"
                className="border-black text-foreground hover:text-sidebar-primary hover:bg-sidebar-primary/10 hover:border-sidebar-primary"
              >
                <Link to="/plans">Buy Case Chronicle</Link>
              </Button>
            </nav>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-12 sm:py-16 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
            Plans and pricing
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose the plan that fits you. Individual for solo use, Business for
            teams and organizations. All plans include privacy-first design and
            GDPR compliance.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* For individuals */}
          <Card id="individual" className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2 text-sidebar-primary mb-1">
                <User className="h-5 w-5" />
                <CardTitle className="text-xl">For individuals</CardTitle>
              </div>
              <CardDescription>
                Solo case management. Your cases, deadlines, and emails in one
                place. No tracking, no clutter.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-sidebar-primary shrink-0" />
                  Unlimited cases
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-sidebar-primary shrink-0" />
                  Email integration per case
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-sidebar-primary shrink-0" />
                  Calendar and events
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-sidebar-primary shrink-0" />
                  Data export (GDPR)
                </li>
              </ul>
              <Button asChild className="mt-auto w-full border-sidebar-primary/50 text-sidebar-primary hover:bg-sidebar-primary/10" variant="outline">
                <Link to="/login">Get started</Link>
              </Button>
            </CardContent>
          </Card>

          {/* For teams */}
          <Card id="teams" className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2 text-sidebar-primary mb-1">
                <Users className="h-5 w-5" />
                <CardTitle className="text-xl">For teams</CardTitle>
              </div>
              <CardDescription>
                Collaborate on cases. Invite others to view or edit with
                controlled access per case.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-sidebar-primary shrink-0" />
                  Everything in Individual
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-sidebar-primary shrink-0" />
                  Share cases with view or edit access
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-sidebar-primary shrink-0" />
                  Invite by email
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-sidebar-primary shrink-0" />
                  Simple, private collaboration
                </li>
              </ul>
              <Button asChild className="mt-auto w-full border-sidebar-primary/50 text-sidebar-primary hover:bg-sidebar-primary/10" variant="outline">
                <Link to="/login">Get started</Link>
              </Button>
            </CardContent>
          </Card>

          {/* For business */}
          <Card id="business" className="flex flex-col border-sidebar-primary/30">
            <CardHeader>
              <div className="flex items-center gap-2 text-sidebar-primary mb-1">
                <Building2 className="h-5 w-5" />
                <CardTitle className="text-xl">For business</CardTitle>
              </div>
              <CardDescription>
                For organizations. Business plan with support and billing for
                teams and companies.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-sidebar-primary shrink-0" />
                  Everything in Teams
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-sidebar-primary shrink-0" />
                  Business account and billing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-sidebar-primary shrink-0" />
                  Subscription management
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-sidebar-primary shrink-0" />
                  GDPR and compliance focus
                </li>
              </ul>
              <Button asChild className="mt-auto w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground border-0">
                <Link to="/login">Get started</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          All plans by AG sound Denmark (CVR: 44789418).{" "}
          <Link to="/terms" className="text-sidebar-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-sidebar-primary hover:underline">
            Privacy
          </Link>
          .
        </p>
      </main>
    </div>
  );
};

export default Plans;
