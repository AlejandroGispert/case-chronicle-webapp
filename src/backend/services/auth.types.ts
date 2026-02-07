import type { Json } from "@/integrations/supabase/types";

/**
 * Auth Abstraction Layer
 *
 * This interface allows swapping auth implementations without changing business logic.
 * Currently implemented for Supabase Auth, but can be extended to support:
 * - Auth0
 * - Firebase Auth
 * - AWS Cognito
 * - Clerk
 * - Custom JWT-based auth
 */

export type OAuthProvider =
  | "google"
  | "github"
  | "apple"
  | "azure"
  | "bitbucket"
  | "discord"
  | "facebook"
  | "gitlab"
  | "keycloak"
  | "linkedin_oidc"
  | "notion"
  | "slack"
  | "spotify"
  | "twitch"
  | "twitter"
  | "workos";

export interface User {
  id: string;
  email?: string;
  role?: string;
  roles?: string[];
  /** Auth provider, e.g. "google" for Google sign-in. Used to lock account type for OAuth users. */
  provider?: string;
}

export interface Session {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  user: User;
}

export type AuthStateChangeEventType =
  | "INITIAL_SESSION"
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED"
  | "PASSWORD_RECOVERY";

export interface AuthStateChangeEvent {
  event: AuthStateChangeEventType;
  session: Session | null;
}

export type AuthStateChangeCallback = (event: AuthStateChangeEvent) => void | Promise<void>;

export interface IAuthService {
  /**
   * Sign in with email and password
   */
  signInWithPassword(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: Error | null }>;

  /**
   * Sign up with email and password
   */
  signUp(email: string, password: string, metadata?: Record<string, Json>): Promise<{ user: User | null; session: Session | null; error: Error | null }>;

  /**
   * Sign out the current user
   */
  signOut(): Promise<{ error: Error | null }>;

  /**
   * Get the current user
   */
  getUser(): Promise<{ user: User | null; error: Error | null }>;

  /**
   * Get the current session
   */
  getSession(): Promise<{ session: Session | null; error: Error | null }>;

  /**
   * Sign in with OAuth provider
   */
  signInWithOAuth(provider: OAuthProvider, options?: { redirectTo?: string; scopes?: string }): Promise<{ error: Error | null }>;

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: AuthStateChangeCallback): { subscription: { unsubscribe: () => void } };

  /**
   * Refresh the current session
   */
  refreshSession(): Promise<{ session: Session | null; error: Error | null }>;
}
