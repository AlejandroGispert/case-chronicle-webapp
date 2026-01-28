import { caseShareModel } from "../models/caseShareModel";
import { requireAuth } from "../auth/authorization";
import { getAuthService } from "../services";

export const caseShareController = {
  async shareCaseWithUser(caseId: string, userEmail: string) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);

    return await caseShareModel.shareCaseWithUser(caseId, userEmail);
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

    return await caseShareModel.unshareCase(caseId, sharedWithUserId);
  },
};
