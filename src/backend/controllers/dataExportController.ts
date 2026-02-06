import { getAuthService } from "../services";
import { requireAuth } from "../auth/authorization";
import { logSuccess } from "../audit";
import { caseModel } from "../models/caseModel";
import { emailModel } from "../models/emailModel";
import { eventModel } from "../models/eventModel";
import { contactModel } from "../models/contactModel";
import { categoryModel } from "../models/categoryModel";
import { profileModel } from "../models/profileModel";
import { documentModel } from "../models/documentModel";

/**
 * GDPR Art. 20 - Data portability: Export all user data as JSON.
 */
export const dataExportController = {
  async exportUserData(): Promise<string> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);

    const [cases, emails, events, contacts, categories, profile] =
      await Promise.all([
        caseModel.getCases(),
        emailModel.getAllEmails(),
        eventModel.getAllEvents(),
        contactModel.getAllContacts(),
        categoryModel.getAllCategories(),
        profileModel.getCurrentProfile(),
      ]);

    // Fetch documents for each case (in parallel)
    const documentPromises = cases.map((c) =>
      documentModel.getDocumentsByCase(c.id)
    );
    const documentsByCase = await Promise.all(documentPromises);
    const documents = documentsByCase.flat();

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      profile,
      cases,
      emails,
      events,
      contacts,
      categories,
      documents,
    };

    await logSuccess(user.id, "data_export", {
      resource_type: "user",
      resource_id: user.id,
    });

    return JSON.stringify(exportData, null, 2);
  },
};
