import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import AuthCallback from "@/pages/AuthCallback";
import About from "./pages/About";
import Settings from "./pages/Settings";
import Index from "./pages/Index";
import Contacts from "./pages/Contacts";
import ShareCase from "./pages/ShareCase";
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
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Redirect root to dashboard if authenticated, otherwise to login */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/dashboard" element={<Dashboard />} />
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
