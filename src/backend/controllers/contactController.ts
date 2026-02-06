import { contactModel } from "../models/contactModel";
import { CreateContactInput, Contact } from "../models/types";
import { requireAuth } from "../auth/authorization";
import { getAuthService } from "../services";
import { logSuccess } from "../audit";

export const contactController = {
  async fetchContactsByCase(caseId: string): Promise<Contact[]> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    return await contactModel.getContactsByCase(caseId);
  },

  async fetchAllContacts(): Promise<Contact[]> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    return await contactModel.getAllContacts();
  },

  async createContact(input: CreateContactInput): Promise<Contact | null> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    const result = await contactModel.createContact(input);
    if (result) {
      await logSuccess(user.id, "data_create", {
        resource_type: "contact",
        resource_id: result.id,
      });
    }
    return result;
  },

  async removeContact(contactId: string): Promise<boolean> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    const success = await contactModel.deleteContact(contactId);
    if (success) {
      await logSuccess(user.id, "data_deletion", {
        resource_type: "contact",
        resource_id: contactId,
      });
    }
    return success;
  },
};
