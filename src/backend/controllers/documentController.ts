import { documentModel, CaseDocument } from "@/backend/models/documentModel";
import { getAuthService } from "../services";

export const documentController = {
  async uploadDocumentToCase(
    file: File,
    caseId: string
  ): Promise<CaseDocument | null> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return null;
      }

      return await documentModel.uploadDocument(file, caseId, user.id);
    } catch (error) {
      console.error("Error in uploadDocumentToCase:", error);
      return null;
    }
  },

  async fetchDocumentsByCase(caseId: string): Promise<CaseDocument[]> {
    try {
      return await documentModel.getDocumentsByCase(caseId);
    } catch (error) {
      console.error("Error in fetchDocumentsByCase:", error);
      return [];
    }
  },

  async removeDocument(documentId: string): Promise<boolean> {
    try {
      return await documentModel.deleteDocument(documentId);
    } catch (error) {
      console.error("Error in removeDocument:", error);
      return false;
    }
  },
};
