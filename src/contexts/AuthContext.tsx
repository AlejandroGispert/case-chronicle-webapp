import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { authController } from "@/backend/controllers/authController";
import { useToast } from "@/hooks/use-toast";
import type { Session, User } from "@/backend/services/auth.types";
import type { Profile } from "@/backend/models/types";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  loginWithGoogle: (redirectTo?: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    redirectTo?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  session: Session | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAuthenticated = !!user;

  const handleAuthSuccess = useCallback(async (session: Session) => {
    if (!session || !session.user) {
      console.warn("Invalid session provided to handleAuthSuccess");
      setUser(null);
      setProfile(null);
      setSession(null);
      return;
    }

    setUser(session.user);
    setSession(session);

    try {
      const profileData = await authController.getCurrentProfile();
      setProfile(profileData);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // Don't fail auth if profile fetch fails - user is still authenticated
      setProfile(null);
    }
  }, []);

  const handleSignOut = useCallback(
    (shouldNavigate: boolean = true) => {
      setUser(null);
      setProfile(null);
      setSession(null);
      if (shouldNavigate) {
        navigate("/login");
      }
    },
    [navigate],
  );

  const refreshProfile = useCallback(async () => {
    try {
      const profileData = await authController.getCurrentProfile();
      setProfile(profileData);
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let sessionChecked = false;

    const authStateChangeResult = authController.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);

        if (!mounted) return;

        switch (event) {
          case "INITIAL_SESSION":
            // This fires when the session is restored from storage on page load
            sessionChecked = true;
            if (session) {
              await handleAuthSuccess(session);
            } else {
              setUser(null);
              setProfile(null);
              setSession(null);
            }
            setLoading(false);
            break;
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
      },
    );

    const subscription = authStateChangeResult.subscription;

    // Fallback: check session if INITIAL_SESSION doesn't fire within 1 second
    const fallbackCheck = setTimeout(async () => {
      if (!mounted || sessionChecked) return;

      try {
        const session = await authController.getCurrentSession();
        if (!mounted) return;

        if (!session) {
          console.error("Auth check failed: No session");
          // Clear any invalid session data from storage
          try {
            await authController.logout();
          } catch (signOutError) {
            console.error("Error clearing invalid session:", signOutError);
          }
          setUser(null);
          setProfile(null);
          setSession(null);
        } else if (session.user) {
          // Verify session is still valid
          const userData = await authController.getCurrentUser();
          if (!userData) {
            console.warn("Session expired or invalid, clearing auth state");
            setUser(null);
            setProfile(null);
            setSession(null);
          } else {
            await handleAuthSuccess(session);
          }
        } else {
          setUser(null);
          setProfile(null);
          setSession(null);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        // Clear potentially corrupted session data
        try {
          await authController.logout();
        } catch (signOutError) {
          // Ignore errors during cleanup
        }
        setUser(null);
        setProfile(null);
        setSession(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(fallbackCheck);
      subscription.unsubscribe();
    };
  }, [handleAuthSuccess, handleSignOut]);

  const login = async (email: string, password: string, redirectTo?: string) => {
    setLoading(true);
    try {
      const { user } = await authController.login(email, password);

      if (user) {
        toast({
          title: "Login successful",
          description: "Welcome to Case Chronicle",
        });
        navigate(redirectTo || "/home", { replace: true });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid email or password";
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (redirectTo?: string) => {
    try {
      await authController.loginWithGoogle(redirectTo);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not sign in with Google";
      toast({
        title: "Google login failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    redirectTo?: string,
  ) => {
    setLoading(true);
    try {
      const { user } = await authController.signup(
        email,
        password,
        firstName,
        lastName,
      );

      if (user) {
        toast({
          title: "Account created",
          description: "Please check your email to verify your account",
        });
        navigate(redirectTo || "/login", { replace: true });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create account";
      toast({
        title: "Signup failed",
        description: message,
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not log out";
      toast({
        title: "Logout failed",
        description: message,
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
        refreshProfile,
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
