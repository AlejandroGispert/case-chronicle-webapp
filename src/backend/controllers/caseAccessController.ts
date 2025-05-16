import { caseAccessModel } from "../models/caseAccessModel";

export const caseAccessController = {
  async fetchPublicCase(code: string) {
    return await caseAccessModel.getCaseByAccessCode(code);
  }
};