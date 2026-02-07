import { getAuthService } from "../services";
import { profileModel } from "../models/profileModel";
import { logSuccess } from "../audit";
import type { AuthStateChangeEventType } from "../services/auth.types";
import type { Session } from "../services/auth.types";
import type { Profile } from "../models/types";

export const authController = {
  async login(email: string, password: string) {
    try {
      const authService = getAuthService();
      const { user, session, error } = await authService.signInWithPassword(email, password);

      if (error) throw error;

      if (user) {
        await logSuccess(user.id, "login", { resource_type: "session" });
      }
      return { user, session };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  async signup(email: string, password: string, firstName: string, lastName: string) {
    try {
      const authService = getAuthService();
      const { user, session, error } = await authService.signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
      });
      
      if (error) throw error;
      
      return { user, session };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
  
  async logout() {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      const { error } = await authService.signOut();
      if (error) throw error;
      if (user) {
        await logSuccess(user.id, "logout", { resource_type: "session" });
      }
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  async getCurrentUser() {
    try {
      const authService = getAuthService();
      const { user, error } = await authService.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  async getCurrentSession() {
    try {
      const authService = getAuthService();
      const { session, error } = await authService.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },
  
  async loginWithGoogle(postAuthRedirect?: string) {
    try {
      if (postAuthRedirect) {
        sessionStorage.setItem("auth_redirect_after", postAuthRedirect);
      }
      const authService = getAuthService();
      const { error } = await authService.signInWithOAuth("google", {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  },
  
  onAuthStateChange(callback: (event: AuthStateChangeEventType, session: Session | null) => void | Promise<void>) {
    const authService = getAuthService();
    return authService.onAuthStateChange((event) => {
      return callback(event.event, event.session);
    });
  },
  
  async getCurrentProfile() {
    return await profileModel.getCurrentProfile();
  },
  
  async updateProfile(updates: Partial<Profile>) {
    return await profileModel.updateProfile(updates);
  }
};
