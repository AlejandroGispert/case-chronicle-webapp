import { caseModel } from "../models/caseModel";
import { CreateCaseInput } from "../models/types";
import { requireAuth } from "../auth/authorization";
import { getAuthService } from "../services";
import { logSuccess } from "../audit";

export const caseController = {
  async fetchAllCases() {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    return await caseModel.getCases();
  },

  async fetchCasesByStatus(status: string) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    return await caseModel.getCasesByStatus(status);
  },

  async fetchCaseWithDetails(caseId: string) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    return await caseModel.getCaseWithRelations(caseId);
  },

  async createNewCase(caseData: CreateCaseInput) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);

    // Ensure user_id matches authenticated user
    const caseDataWithUser = {
      ...caseData,
      user_id: user.id,
    };

    const result = await caseModel.createCase(caseDataWithUser);
    if (result) {
      await logSuccess(user.id, "data_create", {
        resource_type: "case",
        resource_id: result.id,
      });
    }
    return result;
  },

  async updateCaseDetails(caseId: string, updates: any) {
    return await caseModel.updateCase(caseId, updates);
  },

  async removeCase(caseId: string) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    const success = await caseModel.deleteCase(caseId);
    if (success) {
      await logSuccess(user.id, "data_deletion", {
        resource_type: "case",
        resource_id: caseId,
      });
    }
    return success;
  },

  async fetchSharedCases() {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    return await caseModel.getSharedCases();
  },
};
