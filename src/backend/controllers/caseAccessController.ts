import { caseAccessModel } from "../models/caseAccessModel";

export const caseAccessController = {
  async fetchPublicCase(code: string) {
    console.log("[Controller] fetchPublicCase called with code:", code);
    const result = await caseAccessModel.getCaseWithRelationsByAccessCode(code);
    console.log("[Controller] fetchPublicCase result:", result);
    return result;
  },
};