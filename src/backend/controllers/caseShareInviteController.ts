import { caseShareInviteModel } from "../models/caseShareInviteModel";
import { requireAuth } from "../auth/authorization";
import { getAuthService } from "../services";
import { logSuccess } from "../audit";

export const caseShareInviteController = {
  async createInvite(
    caseId: string,
    email: string,
    permissions: { can_view: boolean; can_edit: boolean },
  ) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);

    const result = await caseShareInviteModel.createInvite(
      caseId,
      email,
      permissions,
    );
    if (result?.success) {
      await logSuccess(user!.id, "permission_change", {
        resource_type: "case",
        resource_id: caseId,
        action: "invite_sent",
      });
    }
    return result;
  },

  async getPendingInvites(caseId: string) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);

    return await caseShareInviteModel.getPendingInvites(caseId);
  },

  /** Public - token is the secret, no auth required for preview */
  async getInviteByToken(token: string) {
    return await caseShareInviteModel.getInviteByToken(token);
  },

  async redeemInvite(token: string) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);

    const result = await caseShareInviteModel.redeemInvite(
      token,
      user!.id,
      user!.email ?? "",
    );
    if (result?.success) {
      await logSuccess(user!.id, "permission_change", {
        resource_type: "case",
        resource_id: result.caseId,
        action: "invite_redeemed",
      });
    }
    return result;
  },

  async cancelInvite(caseId: string, inviteId: string) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);

    const success = await caseShareInviteModel.cancelInvite(caseId, inviteId);
    if (success) {
      await logSuccess(user!.id, "permission_change", {
        resource_type: "case",
        resource_id: caseId,
        action: "invite_cancelled",
      });
    }
    return success;
  },
};
