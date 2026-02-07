/**
 * Placeholder payment service. Use this until Stripe (or another provider) is configured.
 * Replace with payment.stripe.ts and wire via getPaymentService() in services/index.ts.
 */

import type {
  IPaymentService,
  SubscriptionInfo,
  CheckoutSessionResult,
} from "./payment.types";

const NO_SUBSCRIPTION: SubscriptionInfo = {
  status: "none",
  planId: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

export class PlaceholderPaymentService implements IPaymentService {
  async getSubscriptionStatus(_userId: string): Promise<SubscriptionInfo> {
    return NO_SUBSCRIPTION;
  }

  async createCheckoutSession(_params: {
    userId: string;
    planId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<CheckoutSessionResult> {
    return {
      url: null,
      error: "Payment is not configured. Set up Stripe (or another provider) to enable billing.",
    };
  }

  async createPortalSession(_params: {
    userId: string;
    returnUrl: string;
  }): Promise<CheckoutSessionResult> {
    return {
      url: null,
      error: "Payment is not configured. Set up Stripe to manage your subscription.",
    };
  }
}
