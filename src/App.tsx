import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SelectedCaseProvider } from "./contexts/SelectedCaseContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Login from "./pages/Login";
import SelectCase from "./pages/SelectCase";
import Inbox from "./pages/Inbox";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import AuthCallback from "@/pages/AuthCallback";
import About from "./pages/About";
import Settings from "./pages/Settings";
import Index from "./pages/Index";
import Contacts from "./pages/Contacts";
import ShareCase from "./pages/ShareCase";
import InviteRedeem from "./pages/InviteRedeem";
import CaseDetailPage from "./pages/CaseDetailPage";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <SelectedCaseProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/invite/:token" element={<InviteRedeem />} />
              
              {/* Redirect root to Home if authenticated, otherwise to login */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/home" element={<Home />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/select-case" element={<SelectCase />} />
                <Route path="/dashboard" element={<Navigate to="/home" replace />} />
                <Route path="/case/:id" element={<CaseDetailPage />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/documents" element={<Index />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/share-case" element={<ShareCase />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/about" element={<About />} />
                {/* ADD ALL CUSTOM PROTECTED ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
              </SelectedCaseProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
