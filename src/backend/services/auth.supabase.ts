/**
 * Supabase Auth implementation of IAuthService
 */

import { SupabaseClient, AuthChangeEvent, Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';
import { IAuthService, User, Session, AuthStateChangeEvent, AuthStateChangeCallback } from './auth.types';

export class SupabaseAuthService implements IAuthService {
  constructor(private client: SupabaseClient) {}

  async signInWithPassword(
    email: string,
    password: string
  ): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
    try {
      const result = await this.client.auth.signInWithPassword({ email, password });

      if (result.error) {
        return {
          user: null,
          session: null,
          error: new Error(result.error.message),
        };
      }

      return {
        user: this.mapUser(result.data.user),
        session: this.mapSession(result.data.session),
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error : new Error('Unknown sign in error'),
      };
    }
  }

  async signUp(
    email: string,
    password: string,
    metadata?: Record<string, any>
  ): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
    try {
      const result = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (result.error) {
        return {
          user: null,
          session: null,
          error: new Error(result.error.message),
        };
      }

      return {
        user: result.data.user ? this.mapUser(result.data.user) : null,
        session: result.data.session ? this.mapSession(result.data.session) : null,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error : new Error('Unknown sign up error'),
      };
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const result = await this.client.auth.signOut();

      if (result.error) {
        return {
          error: new Error(result.error.message),
        };
      }

      return {
        error: null,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Unknown sign out error'),
      };
    }
  }

  async getUser(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const result = await this.client.auth.getUser();

      if (result.error) {
        return {
          user: null,
          error: new Error(result.error.message),
        };
      }

      return {
        user: result.data.user ? this.mapUser(result.data.user) : null,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('Unknown get user error'),
      };
    }
  }

  async getSession(): Promise<{ session: Session | null; error: Error | null }> {
    try {
      const result = await this.client.auth.getSession();

      if (result.error) {
        return {
          session: null,
          error: new Error(result.error.message),
        };
      }

      return {
        session: result.data.session ? this.mapSession(result.data.session) : null,
        error: null,
      };
    } catch (error) {
      return {
        session: null,
        error: error instanceof Error ? error : new Error('Unknown get session error'),
      };
    }
  }

  async signInWithOAuth(
    provider: string,
    options?: { redirectTo?: string; scopes?: string }
  ): Promise<{ error: Error | null }> {
    try {
      const result = await this.client.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: options?.redirectTo,
          scopes: options?.scopes,
        },
      });

      if (result.error) {
        return {
          error: new Error(result.error.message),
        };
      }

      return {
        error: null,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Unknown OAuth error'),
      };
    }
  }

  onAuthStateChange(callback: AuthStateChangeCallback): { subscription: { unsubscribe: () => void } } {
    const { data } = this.client.auth.onAuthStateChange((event: AuthChangeEvent, session: SupabaseSession | null) => {
      const mappedEvent: AuthStateChangeEvent = {
        event: event as any,
        session: session ? this.mapSession(session) : null,
      };
      callback(mappedEvent);
    });

    return {
      subscription: {
        unsubscribe: () => {
          data.subscription.unsubscribe();
        },
      },
    };
  }

  async refreshSession(): Promise<{ session: Session | null; error: Error | null }> {
    try {
      const result = await this.client.auth.refreshSession();

      if (result.error) {
        return {
          session: null,
          error: new Error(result.error.message),
        };
      }

      return {
        session: result.data.session ? this.mapSession(result.data.session) : null,
        error: null,
      };
    } catch (error) {
      return {
        session: null,
        error: error instanceof Error ? error : new Error('Unknown refresh session error'),
      };
    }
  }

  private mapUser(user: SupabaseUser): User {
    return {
      id: user.id,
      email: user.email,
      ...user,
    };
  }

  private mapSession(session: SupabaseSession): Session {
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      expires_in: session.expires_in,
      token_type: session.token_type,
      user: this.mapUser(session.user),
      ...session,
    };
  }
}
