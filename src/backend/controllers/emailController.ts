import { emailModel } from "../models/emailModel";
import { CreateEmailInput, EmailAttachment, Email } from "../models/types";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
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
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error("No authenticated user found");
        return null;
      }

      // Use the provided date and time from emailData
      const emailWithAttachments: CreateEmailInput = {
        ...emailData,
        user_id: user.user.id,
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
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('emails')
        .update({
          date: emailData.date,
          time: emailData.time,
        })
        .eq('id', emailData.id)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating email:", error);
      return null;
    }
  },
};
