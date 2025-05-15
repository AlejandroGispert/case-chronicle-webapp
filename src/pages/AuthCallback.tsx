// src/pages/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("OAuth callback error:", error);
        navigate("/login");
      } else if (session) {
        navigate("/dashboard");
      } else {
        setTimeout(() => navigate("/dashboard"), 1000); // fallback
      }
    };

    checkSession();
  }, [navigate]);

  return <p>Signing in with Google...</p>;
}
