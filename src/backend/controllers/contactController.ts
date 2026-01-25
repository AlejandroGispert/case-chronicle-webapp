import { contactModel } from "../models/contactModel";
import { CreateContactInput, Contact } from "../models/types";

export const contactController = {
  async fetchContactsByCase(caseId: string): Promise<Contact[]> {
    return await contactModel.getContactsByCase(caseId);
  },

  async fetchAllContacts(): Promise<Contact[]> {
    return await contactModel.getAllContacts();
  },

  async createContact(input: CreateContactInput): Promise<Contact | null> {
    return await contactModel.createContact(input);
  },

  async removeContact(contactId: string): Promise<boolean> {
    return await contactModel.deleteContact(contactId);
  },
};
