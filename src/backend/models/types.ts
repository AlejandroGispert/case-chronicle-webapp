
import { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Case = Database["public"]["Tables"]["cases"]["Row"];
export type Email = Database["public"]["Tables"]["emails"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];

export type CaseWithRelations = Case & {
  emails: Email[];
  events: Event[];
};

// Input types for database operations
export interface CreateCaseInput {
  title: string;
  number: string;
  client: string;
  status: 'active' | 'pending' | 'closed';
  user_id: string; // Add user_id field
}

export interface EmailAttachment {
  id: string;
  filename: string;
  type: string;
  path?: string;
  url: string;
  size?: number;
}

export interface CreateEmailInput {
  case_id: string;
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  date: string;
  time: string;
  user_id: string;
  attachments?: EmailAttachment[];
}

export interface CreateEventInput {
  case_id: string;
  title: string;
  description: string;
  event_type: string;
  date: string;
  time: string;
  user_id: string;
}