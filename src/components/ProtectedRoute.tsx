import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute = ({ redirectPath = "/login" }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, profile } = useAuth();
  const location = useLocation();

  // Wait for auth check to complete before redirecting
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Require business model choice (B2B/B2C) before using the app, unless already on onboarding
  const needsOnboarding =
    profile !== null &&
    profile !== undefined &&
    (profile.business_model === null || profile.business_model === undefined) &&
    location.pathname !== "/onboarding";

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
