import { emailModel } from "../models/emailModel";
import { CreateEmailInput, EmailAttachment, Email } from "../models/types";
import { format } from "date-fns";
import { getDatabaseService, getAuthService } from "../services";
import { Email as ModelEmail } from "../models/types";

export const emailController = {
  async fetchEmailsByCase(caseId: string) {
    try {
      const emails = await emailModel.getEmailsByCase(caseId);
      console.log("Fetched emails:", emails);
      return emails;
    } catch (error) {
      console.error("Error in fetchEmailsByCase:", error);
      return [];
    }
  },

  async fetchAllEmails() {
    try {
      const emails = await emailModel.getAllEmails();
      console.log("Fetched all emails:", emails);
      return emails;
    } catch (error) {
      console.error("Error in fetchAllEmails:", error);
      return [];
    }
  },

  async fetchUnassignedEmails() {
    try {
      const emails = await emailModel.getUnassignedEmails();
      console.log("Fetched unassigned emails:", emails);
      return emails;
    } catch (error) {
      console.error("Error in fetchUnassignedEmails:", error);
      return [];
    }
  },

  async assignEmailToCase(emailId: string, caseId: string) {
    try {
      return await emailModel.assignEmailToCase(emailId, caseId);
    } catch (error) {
      console.error("Error in assignEmailToCase:", error);
      return false;
    }
  },

  async createNewEmail(emailData: CreateEmailInput, files?: File[]) {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return null;
      }

      // Use the provided date and time from emailData
      const emailWithAttachments: CreateEmailInput = {
        ...emailData,
        user_id: user.id,
        date: emailData.date,
        time: emailData.time,
        attachments: emailData.attachments,
      };

      console.log("Creating email with data:", emailWithAttachments);
      const createdEmail = await emailModel.createEmail(emailWithAttachments);
      console.log("Created email:", createdEmail);
      return createdEmail;
    } catch (error) {
      console.error("Error in createNewEmail:", error);
      return null;
    }
  },

  async removeEmail(emailId: string) {
    try {
      return await emailModel.deleteEmail(emailId);
    } catch (error) {
      console.error("Error in removeEmail:", error);
      return false;
    }
  },

  async updateEmail(emailData: Partial<ModelEmail>) {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) return null;

      const db = getDatabaseService();
      const { data, error } = await db
        .from<ModelEmail>('emails')
        .update({
          date: emailData.date,
          time: emailData.time,
        })
        .eq('id', emailData.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating email:", error);
      return null;
    }
  },

  async assignContactToEmail(emailId: string, contactId: string | null) {
    try {
      return await emailModel.assignContactToEmail(emailId, contactId);
    } catch (error) {
      console.error("Error in assignContactToEmail:", error);
      return false;
    }
  },
};
