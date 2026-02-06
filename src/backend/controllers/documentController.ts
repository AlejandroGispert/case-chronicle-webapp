import { documentModel, CaseDocument } from "@/backend/models/documentModel";
import { getAuthService } from "../services";
import { requireAuth } from "../auth/authorization";
import { logSuccess } from "../audit";

export const documentController = {
  async uploadDocumentToCase(
    file: File,
    caseId: string
  ): Promise<CaseDocument | null> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      requireAuth(user);
      const result = await documentModel.uploadDocument(file, caseId, user.id);
      if (result) {
        await logSuccess(user.id, "file_upload", {
          resource_type: "document",
          resource_id: result.id,
        });
      }
      return result;
    } catch (error) {
      console.error("Error in uploadDocumentToCase:", error);
      return null;
    }
  },

  async fetchDocumentsByCase(caseId: string): Promise<CaseDocument[]> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      requireAuth(user);
      return await documentModel.getDocumentsByCase(caseId);
    } catch (error) {
      console.error("Error in fetchDocumentsByCase:", error);
      return [];
    }
  },

  async removeDocument(documentId: string): Promise<boolean> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      requireAuth(user);
      const success = await documentModel.deleteDocument(documentId);
      if (success) {
        await logSuccess(user.id, "data_deletion", {
          resource_type: "document",
          resource_id: documentId,
        });
      }
      return success;
    } catch (error) {
      console.error("Error in removeDocument:", error);
      return false;
    }
  },
};
