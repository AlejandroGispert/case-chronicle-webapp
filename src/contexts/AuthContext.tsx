import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { authController } from "@/backend/controllers/authController";
import { useToast } from "@/hooks/use-toast";
import { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  user: User | null;
  profile: any | null;
  loading: boolean;
  session: Session | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAuthenticated = !!user;

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);

        switch (event) {
          case "SIGNED_IN":
          case "TOKEN_REFRESHED":
            if (session) {
              await handleAuthSuccess(session);
            }
            break;
          case "SIGNED_OUT":
            handleSignOut(true);
            break;
        }
      }
    );

    checkInitialAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = async (session: Session) => {
    setUser(session.user);
    setSession(session);

    try {
      const profileData = await authController.getCurrentProfile();
      setProfile(profileData);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const handleSignOut = (shouldNavigate: boolean = true) => {
    setUser(null);
    setProfile(null);
    setSession(null);
    if (shouldNavigate) {
      navigate("/login");
    }
  };

  const checkInitialAuth = async () => {
    try {
      // Wait for Supabase to restore session from localStorage
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth check failed:", error);
        setUser(null);
        setProfile(null);
        setSession(null);
      } else if (data.session) {
        await handleAuthSuccess(data.session);
      } else {
        // No session found, but don't navigate - let ProtectedRoute handle it
        setUser(null);
        setProfile(null);
        setSession(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setProfile(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user } = await authController.login(email, password);

      if (user) {
        toast({
          title: "Login successful",
          description: "Welcome to Case Chronicle",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Google login failed",
        description: error.message || "Could not sign in with Google",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    setLoading(true);
    try {
      const { user } = await authController.signup(
        email,
        password,
        firstName,
        lastName
      );

      if (user) {
        toast({
          title: "Account created",
          description: "Please check your email to verify your account",
        });
        navigate("/login");
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authController.logout();
      handleSignOut(true);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "Could not log out",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        loginWithGoogle,
        signup,
        logout,
        user,
        profile,
        loading,
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
