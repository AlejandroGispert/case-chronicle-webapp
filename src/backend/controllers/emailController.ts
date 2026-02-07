import { emailModel } from "../models/emailModel";
import { CreateEmailInput, EmailAttachment, Email } from "../models/types";
import { format } from "date-fns";
import { getDatabaseService, getAuthService } from "../services";
import { Email as ModelEmail } from "../models/types";
import { requireAuth } from "../auth/authorization";
import { logSuccess } from "../audit";

export const emailController = {
  async fetchEmailsByCase(caseId: string) {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      requireAuth(user);
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
      const authService = getAuthService();
      const { user } = await authService.getUser();
      requireAuth(user);
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
      const authService = getAuthService();
      const { user } = await authService.getUser();
      requireAuth(user);
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
      const authService = getAuthService();
      const { user } = await authService.getUser();
      requireAuth(user);
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
      requireAuth(user);

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
      if (createdEmail) {
        await logSuccess(user.id, "data_create", {
          resource_type: "email",
          resource_id: createdEmail.id,
        });
      }
      return createdEmail;
    } catch (error) {
      console.error("Error in createNewEmail:", error);
      return null;
    }
  },

  async removeEmail(emailId: string) {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      requireAuth(user);
      const success = await emailModel.deleteEmail(emailId);
      if (success) {
        await logSuccess(user.id, "data_deletion", {
          resource_type: "email",
          resource_id: emailId,
        });
      }
      return success;
    } catch (error) {
      console.error("Error in removeEmail:", error);
      return false;
    }
  },

  async updateEmail(emailData: Partial<ModelEmail>) {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      requireAuth(user);

      const updatePayload: Partial<ModelEmail> = {};
      if (emailData.date !== undefined) updatePayload.date = emailData.date;
      if (emailData.time !== undefined) updatePayload.time = emailData.time;
      if (emailData.content !== undefined) updatePayload.content = emailData.content;
      if (emailData.subject !== undefined) updatePayload.subject = emailData.subject;
      if (emailData.sender !== undefined) updatePayload.sender = emailData.sender;
      if (emailData.recipient !== undefined) updatePayload.recipient = emailData.recipient;

      const db = getDatabaseService();
      const { data, error } = await db
        .from<ModelEmail>('emails')
        .update(updatePayload)
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
      const authService = getAuthService();
      const { user } = await authService.getUser();
      requireAuth(user);
      return await emailModel.assignContactToEmail(emailId, contactId);
    } catch (error) {
      console.error("Error in assignContactToEmail:", error);
      return false;
    }
  },

  async assignCategoryToEmail(emailId: string, categoryId: string | null) {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      requireAuth(user);
      return await emailModel.assignCategoryToEmail(emailId, categoryId);
    } catch (error) {
      console.error("Error in assignCategoryToEmail:", error);
      return false;
    }
  },
};
