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

      // Create formatted date and time for the email
      const now = new Date();
      const formattedDate = format(now, "yyyy-MM-dd");
      const formattedTime = format(now, "HH:mm");

      // Upload attachments if any
      const attachments: EmailAttachment[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const uploadedAttachment = await emailModel.uploadAttachment(
            file,
            user.user.id
          );
          if (uploadedAttachment) {
            attachments.push(uploadedAttachment);
          }
        }
      }

      // Create email with attachments
      const emailWithAttachments: CreateEmailInput = {
        ...emailData,
        user_id: user.user.id,
        date: formattedDate,
        time: formattedTime,
        attachments: attachments.length > 0 ? attachments : undefined,
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
