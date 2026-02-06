import { caseShareModel } from "../models/caseShareModel";
import { requireAuth } from "../auth/authorization";
import { getAuthService } from "../services";
import { logSuccess } from "../audit";

export const caseShareController = {
  async shareCaseWithUser(caseId: string, userEmail: string) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);

    const result = await caseShareModel.shareCaseWithUser(caseId, userEmail);
    if (result?.success) {
      await logSuccess(user.id, "permission_change", {
        resource_type: "case",
        resource_id: caseId,
      });
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
};
