import { supabase } from "@/integrations/supabase/client";
import { Email, CreateEmailInput, EmailAttachment } from "./types";
import type Json from "@/types/json";
// Define the EmailModel
export const emailModel = {
  // Fetch emails by case ID
  async getEmailsByCase(caseId: string): Promise<Email[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        console.error("No authenticated user found");
        return [];
      }

      console.log("Fetching emails for case:", caseId);
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("case_id", caseId)
        .eq("user_id", user.user.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      if (error) {
        console.error("Error fetching emails:", error.message, error.details);
        return [];
      }

      console.log("Fetched emails data:", data);
      return data as Email[];
    } catch (error) {
      console.error("Error in getEmailsByCase:", error);
      return [];
    }
  },

  // Fetch unassigned emails (emails without a case_id)
  async getUnassignedEmails(): Promise<Email[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        console.error("No authenticated user found");
        return [];
      }

      console.log("Fetching unassigned emails");
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .is("case_id", null)
        .eq("user_id", user.user.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      if (error) {
        console.error("Error fetching unassigned emails:", error.message, error.details);
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
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
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
        user_id: user.user.id,
        attachments: attachments as unknown as Json,
      };

      console.log("Inserting email with data:", emailWithUser); // Add logging
      const { data, error } = await supabase
        .from("emails")
        .insert([emailWithUser])
        .select()
        .single();

      if (error) {
        console.error("Error creating email:", error.message, error.details);
        return null;
      }

      console.log("Created email:", data); // Add logging
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

    const { data, error } = await supabase.storage
      .from("email_attachments")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading attachment:", error.message);
      return null;
    }

    // Get the public URL for the uploaded attachment
    const { data: publicUrlData } = supabase.storage
      .from("email_attachments")
      .getPublicUrl(fileName);

    return publicUrlData?.publicUrl
      ? {
          id: fileName,
          filename: file.name,
          type: file.type,
          url: publicUrlData.publicUrl,
          size: file.size,
        }
      : null;
  },

  // Delete an email and its associated attachments from Supabase Storage
  async deleteEmail(emailId: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return false;

    const { data: email, error: fetchError } = await supabase
      .from("emails")
      .select("attachments")
      .eq("id", emailId)
      .eq("user_id", user.user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching email for deletion:", fetchError.message);
      return false;
    }
    const attachments: EmailAttachment[] = email.attachments
      ? JSON.parse(email.attachments as unknown as string)
      : [];
    // Delete attachments from Supabase Storage
    for (const attachment of attachments) {
      if (attachment.path) {
        const { error: removeError } = await supabase.storage
          .from("email_attachments")
          .remove([attachment.path]);

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
    const { error: deleteError } = await supabase
      .from("emails")
      .delete()
      .eq("id", emailId)
      .eq("user_id", user.user.id);

    if (deleteError) {
      console.error("Error deleting email:", deleteError.message);
      return false;
    }

    return true;
  },

  // Assign email to a case
  async assignEmailToCase(emailId: string, caseId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        console.error("No authenticated user found");
        return false;
      }

      const { error } = await supabase
        .from("emails")
        .update({ case_id: caseId })
        .eq("id", emailId)
        .eq("user_id", user.user.id);

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
};
