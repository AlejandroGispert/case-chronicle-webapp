import { getAuthService } from "../services";
import { requireAuth } from "../auth/authorization";
import { billingModel } from "../models/billingModel";
import type { SubscriptionInfo } from "../services/payment.types";

export const billingController = {
  async getSubscription(): Promise<SubscriptionInfo> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    return billingModel.getCurrentSubscription();
  },

  async getCheckoutUrl(planId: string): Promise<{ url: string | null; error: string | null }> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return billingModel.createCheckoutSession(
      planId,
      `${origin}/home?checkout=success`,
      `${origin}/settings?checkout=cancel`
    );
  },

  async getPortalUrl(): Promise<{ url: string | null; error: string | null }> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return billingModel.createPortalSession(`${origin}/settings`);
  },
};
