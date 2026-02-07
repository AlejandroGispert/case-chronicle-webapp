import { Database } from "@/integrations/supabase/types";

/** Event data from NewEventModal form, before case_id and user_id are added */
export interface NewEventFormData {
  id?: string;
  title: string;
  date: string;
  time: string;
  description: string;
  event_type: string;
}

export interface Attachment {
  id: string;
  filename: string;
  type: string;
  url: string;
  path?: string;
  size?: number;
}

export type Email = Database["public"]["Tables"]["emails"]["Row"];

export type Event = Database["public"]["Tables"]["events"]["Row"];

export interface Case {
  id: string;
  title: string;
  number: string;
  client: string;
  status: "active" | "pending" | "closed";
  dateCreated: string;
  emails: Email[];
  events: Event[];
}

export type CreateEmailInput = Database["public"]["Tables"]["emails"]["Insert"];
export type CreateEventInput = Database["public"]["Tables"]["events"]["Insert"];

export type UpdateEmailInput = Database["public"]["Tables"]["emails"]["Update"];
export type UpdateEventInput = Database["public"]["Tables"]["events"]["Update"];
