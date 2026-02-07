/**
 * Payment / Billing Abstraction Layer
 *
 * This interface allows swapping payment implementations (e.g. Stripe, Paddle)
 * without changing business logic. Controllers and models use this only.
 */

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "unpaid"
  | "none";

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  planId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface CheckoutSessionResult {
  url: string | null;
  error: string | null;
}

export interface IPaymentService {
  /**
   * Get current subscription info for the given user (or current auth user).
   * Returns "none" when no subscription exists.
   */
  getSubscriptionStatus(userId: string): Promise<SubscriptionInfo>;

  /**
   * Create a checkout session for a plan (e.g. Stripe Checkout URL).
   * Returns URL to redirect the user to, or error.
   */
  createCheckoutSession(params: {
    userId: string;
    planId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<CheckoutSessionResult>;

  /**
   * Create a customer portal session URL (manage subscription, payment methods).
   */
  createPortalSession(params: {
    userId: string;
    returnUrl: string;
  }): Promise<CheckoutSessionResult>;
}
