import { Database } from "@/integrations/supabase/types";

// Database rows types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Case = Database["public"]["Tables"]["cases"]["Row"];
export type EmailDb = Database["public"]["Tables"]["emails"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];

// Enhanced Email type with optional attachments field
export type Email = EmailDb & {
  attachments?: EmailAttachment[]; // Attachments enriched after fetch
};

// Case with related emails and events
export type CaseWithRelations = Case & {
  emails: Email[];
  events: Event[];
};

// Input types for database operations

// CreateCaseInput represents the structure to create a case
export interface CreateCaseInput {
  title: string;
  number: string;
  client: string;
  status: "active" | "pending" | "closed";
  user_id: string;
}

// EmailAttachment represents the metadata of an email attachment
export interface EmailAttachment {
  id: string;
  filename: string;
  type: string;
  path?: string;
  url: string;
  size?: number;
}

// CreateEmailInput represents the structure to create an email
export interface CreateEmailInput {
  id: string;
  case_id: string;
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  date: string;
  time: string;
  user_id: string;
  attachments?: EmailAttachment[]; // Optional attachments array
}

// CreateEventInput represents the structure to create an event
export interface CreateEventInput {
  case_id: string;
  title: string;
  description: string;
  event_type: string;
  date: string;
  time: string;
  user_id: string;
}

// CreateContactInput represents the structure to create a contact (user_id set by backend from auth)
export interface CreateContactInput {
  case_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
}
