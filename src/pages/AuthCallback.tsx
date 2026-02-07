// src/pages/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authController } from "@/backend/controllers/authController";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const session = await authController.getCurrentSession();

      if (!session) {
        console.error("OAuth callback error: No session");
        navigate("/login");
      } else {
        const redirect = sessionStorage.getItem("auth_redirect_after");
        if (redirect) {
          sessionStorage.removeItem("auth_redirect_after");
          navigate(redirect, { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      }
    };

    checkSession();
  }, [navigate]);

  return <p>Signing in with Google...</p>;
}
