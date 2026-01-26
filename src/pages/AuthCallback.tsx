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
        navigate("/dashboard");
      }
    };

    checkSession();
  }, [navigate]);

  return <p>Signing in with Google...</p>;
}
