import { supabase } from "@/integrations/supabase/client";
import { Contact, CreateContactInput } from "./types";

export const contactModel = {
  async getContactsByCase(caseId: string): Promise<Contact[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("case_id", caseId)
      .eq("user_id", user.user.id)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching contacts:", error);
      return [];
    }
    return data || [];
  },

  async getAllContacts(): Promise<Contact[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.user.id)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching all contacts:", error);
      return [];
    }
    return data || [];
  },

  async createContact(input: CreateContactInput): Promise<Contact | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return null;

    const withUser = {
      ...input,
      user_id: user.user.id,
    };

    const { data, error } = await supabase
      .from("contacts")
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
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", contactId)
      .eq("user_id", user.user.id);

    if (error) {
      console.error("Error deleting contact:", error);
      return false;
    }
    return true;
  },
};
