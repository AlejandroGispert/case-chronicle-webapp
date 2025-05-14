import { emailModel } from "../models/emailModel";
import { CreateEmailInput, EmailAttachment } from "../models/types";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

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
};
