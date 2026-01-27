import { getDatabaseService, getAuthService, getStorageService } from "../services";
import { Email, CreateEmailInput, EmailAttachment } from "./types";
import type Json from "@/types/json";

const EMAIL_ATTACHMENTS_BUCKET = "email_attachments";

export const emailModel = {
  // Fetch emails by case ID
  async getEmailsByCase(caseId: string): Promise<Email[]> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }

      console.log("Fetching emails for case:", caseId);
      const db = getDatabaseService();
      const { data, error } = await db
        .from<Email>("emails")
        .select("*")
        .eq("case_id", caseId)
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false })
        .execute();

      if (error) {
        console.error("Error fetching emails:", error.message);
        return [];
      }

      console.log("Fetched emails data:", data);
      return (data || []) as Email[];
    } catch (error) {
      console.error("Error in getEmailsByCase:", error);
      return [];
    }
  },

  // Fetch all emails for the user
  async getAllEmails(): Promise<Email[]> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }

      console.log("Fetching all emails");
      const db = getDatabaseService();
      const { data, error } = await db
        .from<Email>("emails")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false })
        .execute();

      if (error) {
        console.error("Error fetching all emails:", error.message);
        return [];
      }

      console.log("Fetched all emails data:", data);
      
      // Parse attachments from JSON to EmailAttachment[]
      const processedEmails = (data || []).map((email) => ({
        ...email,
        attachments: email.attachments
          ? (typeof email.attachments === "string"
              ? JSON.parse(email.attachments)
              : email.attachments)
          : [],
      }));

      return processedEmails as Email[];
    } catch (error) {
      console.error("Error in getAllEmails:", error);
      return [];
    }
  },

  // Fetch unassigned emails (emails without a case_id)
  async getUnassignedEmails(): Promise<Email[]> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }

      console.log("Fetching unassigned emails");
      const db = getDatabaseService();
      const { data, error } = await db
        .from<Email>("emails")
        .select("*")
        .is("case_id", null)
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false })
        .execute();

      if (error) {
        console.error("Error fetching unassigned emails:", error.message);
        return [];
      }

      console.log("Fetched unassigned emails data:", data);
      
      // Parse attachments from JSON to EmailAttachment[]
      const processedEmails = (data || []).map((email) => ({
        ...email,
        attachments: email.attachments
          ? (typeof email.attachments === "string"
              ? JSON.parse(email.attachments)
              : email.attachments)
          : [],
      }));

      return processedEmails as Email[];
    } catch (error) {
      console.error("Error in getUnassignedEmails:", error);
      return [];
    }
  },

  // Create a new email with attachment metadata
  async createEmail(emailData: CreateEmailInput): Promise<Email | null> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return null;
      }

      // Convert attachments to plain JSON-compatible objects
      const attachments = (emailData.attachments || []).map((att) => ({
        id: att.id,
        filename: att.filename,
        type: att.type,
        url: att.url,
        path: att.path ?? null,
        size: att.size ?? null,
      }));

      const emailWithUser = {
        ...emailData,
        user_id: user.id,
        attachments: attachments as unknown as Json,
      };

      console.log("Inserting email with data:", emailWithUser);
      const db = getDatabaseService();
      const { data, error } = await db
        .from<Email>("emails")
        .insert(emailWithUser)
        .select()
        .single();

      if (error) {
        console.error("Error creating email:", error.message);
        return null;
      }

      console.log("Created email:", data);
      return data as Email;
    } catch (error) {
      console.error("Error in createEmail:", error);
      return null;
    }
  },

  // Upload an attachment for an email
  async uploadAttachment(
    file: File,
    userId: string
  ): Promise<EmailAttachment | null> {
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    const storageService = getStorageService();

    const { data, error } = await storageService.upload(
      EMAIL_ATTACHMENTS_BUCKET,
      fileName,
      file,
      {
        cacheControl: "3600",
        upsert: false,
      }
    );

    if (error || !data) {
      console.error("Error uploading attachment:", error?.message);
      return null;
    }

    // Get the public URL for the uploaded attachment
    const { publicUrl } = storageService.getPublicUrl(EMAIL_ATTACHMENTS_BUCKET, fileName);

    return publicUrl
      ? {
          id: fileName,
          filename: file.name,
          type: file.type,
          url: publicUrl,
          size: file.size,
        }
      : null;
  },

  // Delete an email and its associated attachments from storage
  async deleteEmail(emailId: string): Promise<boolean> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return false;

    const db = getDatabaseService();
    const { data: email, error: fetchError } = await db
      .from<Email>("emails")
      .select("attachments")
      .eq("id", emailId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !email) {
      console.error("Error fetching email for deletion:", fetchError?.message);
      return false;
    }

    const attachments: EmailAttachment[] = email.attachments
      ? JSON.parse(email.attachments as unknown as string)
      : [];

    // Delete attachments from storage
    const storageService = getStorageService();
    for (const attachment of attachments) {
      if (attachment.path) {
        const { error: removeError } = await storageService.remove(
          EMAIL_ATTACHMENTS_BUCKET,
          [attachment.path]
        );

        if (removeError) {
          console.warn(
            "Failed to remove attachment:",
            attachment.path,
            removeError.message
          );
        }
      }
    }

    // Delete email record
    const { error: deleteError } = await db
      .from("emails")
      .delete()
      .eq("id", emailId)
      .eq("user_id", user.id)
      .execute();

    if (deleteError) {
      console.error("Error deleting email:", deleteError.message);
      return false;
    }

    return true;
  },

  // Assign email to a case
  async assignEmailToCase(emailId: string, caseId: string): Promise<boolean> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return false;
      }

      const db = getDatabaseService();
      const { error } = await db
        .from("emails")
        .update({ case_id: caseId })
        .eq("id", emailId)
        .eq("user_id", user.id)
        .execute();

      if (error) {
        console.error("Error assigning email to case:", error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in assignEmailToCase:", error);
      return false;
    }
  },

  // Assign contact to an email
  async assignContactToEmail(emailId: string, contactId: string | null): Promise<boolean> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return false;
      }

      const db = getDatabaseService();
      const { error } = await db
        .from("emails")
        .update({ contact_id: contactId })
        .eq("id", emailId)
        .eq("user_id", user.id)
        .execute();

      if (error) {
        console.error("Error assigning contact to email:", error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in assignContactToEmail:", error);
      return false;
    }
  },

  // Assign category to an email
  async assignCategoryToEmail(emailId: string, categoryId: string | null): Promise<boolean> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return false;
      }

      const db = getDatabaseService();
      const { error } = await db
        .from("emails")
        .update({ category_id: categoryId })
        .eq("id", emailId)
        .eq("user_id", user.id)
        .execute();

      if (error) {
        console.error("Error assigning category to email:", error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in assignCategoryToEmail:", error);
      return false;
    }
  },
};
