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
};
