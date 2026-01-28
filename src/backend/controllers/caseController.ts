import { caseModel } from "../models/caseModel";
import { CreateCaseInput } from "../models/types";
import { requireAuth } from "../auth/authorization";
import { getAuthService } from "../services";

export const caseController = {
  async fetchAllCases() {
    return await caseModel.getCases();
  },

  async fetchCasesByStatus(status: string) {
    return await caseModel.getCasesByStatus(status);
  },

  async fetchCaseWithDetails(caseId: string) {
    return await caseModel.getCaseWithRelations(caseId);
  },

  async createNewCase(caseData: CreateCaseInput) {
    return await caseModel.createCase(caseData);
  },

  async updateCaseDetails(caseId: string, updates: any) {
    return await caseModel.updateCase(caseId, updates);
  },

  async removeCase(caseId: string) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    return await caseModel.deleteCase(caseId);
  },

  async fetchSharedCases() {
    return await caseModel.getSharedCases();
  },
};
