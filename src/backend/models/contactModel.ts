import { getDatabaseService, getAuthService } from "../services";
import { Contact, CreateContactInput } from "./types";

export const contactModel = {
  async getContactsByCase(caseId: string): Promise<Contact[]> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return [];

    const db = getDatabaseService();
    const { data, error } = await db
      .from<Contact>("contacts")
      .select("*")
      .eq("case_id", caseId)
      .eq("user_id", user.id)
      .order("name", { ascending: true })
      .execute();

    if (error) {
      console.error("Error fetching contacts:", error);
      return [];
    }
    return data || [];
  },

  async getAllContacts(): Promise<Contact[]> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return [];

    const db = getDatabaseService();
    const { data, error } = await db
      .from<Contact>("contacts")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true })
      .execute();

    if (error) {
      console.error("Error fetching all contacts:", error);
      return [];
    }
    return data || [];
  },

  async createContact(input: CreateContactInput): Promise<Contact | null> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return null;

    const withUser = {
      ...input,
      user_id: user.id,
    };

    const db = getDatabaseService();
    const { data, error } = await db
      .from<Contact>("contacts")
      .insert(withUser)
      .select()
      .single();

    if (error) {
      console.error("Error creating contact:", error);
      return null;
    }
    return data;
  },

  async deleteContact(contactId: string): Promise<boolean> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return false;

    const db = getDatabaseService();
    const { error } = await db
      .from("contacts")
      .delete()
      .eq("id", contactId)
      .eq("user_id", user.id)
      .execute();

    if (error) {
      console.error("Error deleting contact:", error);
      return false;
    }
    return true;
  },
};
