import { getPaymentService } from "../services";
import { getAuthService } from "../services";
import type { SubscriptionInfo } from "../services/payment.types";

export const billingModel = {
  async getCurrentSubscription(): Promise<SubscriptionInfo> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) {
      return {
        status: "none",
        planId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }
    const paymentService = getPaymentService();
    return paymentService.getSubscriptionStatus(user.id);
  },

  async createCheckoutSession(planId: string, successUrl: string, cancelUrl: string): Promise<{ url: string | null; error: string | null }> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) {
      return { url: null, error: "Not authenticated" };
    }
    const paymentService = getPaymentService();
    return paymentService.createCheckoutSession({
      userId: user.id,
      planId,
      successUrl,
      cancelUrl,
    });
  },

  async createPortalSession(returnUrl: string): Promise<{ url: string | null; error: string | null }> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) {
      return { url: null, error: "Not authenticated" };
    }
    const paymentService = getPaymentService();
    return paymentService.createPortalSession({
      userId: user.id,
      returnUrl,
    });
  },
};
