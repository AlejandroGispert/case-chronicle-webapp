import { caseShareModel } from "../models/caseShareModel";
import { caseShareInviteController } from "./caseShareInviteController";
import { requireAuth } from "../auth/authorization";
import { getAuthService } from "../services";
import { logSuccess } from "../audit";

export const caseShareController = {
  async shareCaseWithUser(
    caseId: string,
    userEmail: string,
    permissions?: { can_view?: boolean; can_edit?: boolean },
  ) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);

    const result = await caseShareModel.shareCaseWithUser(
      caseId,
      userEmail,
      permissions,
    );

    if (result?.success) {
      await logSuccess(user.id, "permission_change", {
        resource_type: "case",
        resource_id: caseId,
      });
      return result;
    }

    // User doesn't have an account - create pending invite
    if (result?.error === "USER_NOT_FOUND") {
      const inviteResult = await caseShareInviteController.createInvite(
        caseId,
        userEmail,
        {
          can_view: permissions?.can_view ?? true,
          can_edit: permissions?.can_edit ?? false,
        },
      );
      if (inviteResult?.success) {
        return {
          success: true,
          inviteLink: inviteResult.inviteLink,
          pending: true,
        };
      }
      return inviteResult;
    }

    return result;
  },

  async getSharedUsers(caseId: string) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);

    return await caseShareModel.getSharedUsers(caseId);
  },

  async unshareCase(caseId: string, sharedWithUserId: string) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);

    const success = await caseShareModel.unshareCase(caseId, sharedWithUserId);
    if (success) {
      await logSuccess(user.id, "permission_change", {
        resource_type: "case",
        resource_id: caseId,
      });
    }
    return success;
  },

  async updatePermissions(
    caseId: string,
    sharedWithUserId: string,
    permissions: { can_view: boolean; can_edit: boolean },
  ) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);

    const result = await caseShareModel.updatePermissions(
      caseId,
      sharedWithUserId,
      permissions,
    );
    if (result?.success) {
      await logSuccess(user.id, "permission_change", {
        resource_type: "case",
        resource_id: caseId,
      });
    }
    return result;
  },
};
