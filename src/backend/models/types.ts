import { Database, Json } from "@/integrations/supabase/types";

// Database rows types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Case = Database["public"]["Tables"]["cases"]["Row"];
export type EmailDb = Database["public"]["Tables"]["emails"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];

// Enhanced Email type: same as DB row but attachments parsed to EmailAttachment[]
export type Email = Omit<EmailDb, "attachments"> & {
  attachments?: EmailAttachment[];
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
  /**
   * Optional case number provided by the user.
   * If omitted, the backend will generate a case number.
   */
  number?: string;
  /**
   * Optional client name.
   * For non-professional users this may be omitted.
   */
  client?: string;
  status: "active" | "pending" | "closed";
  user_id: string;
  /**
   * Optional creation date override.
   * Defaults to the current timestamp when not provided.
   */
  date_created?: string;
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

/**
 * Parses attachments from DB JSON (string or already-parsed array).
 * Uses no any/unknown; builds EmailAttachment[] by validating shape.
 */
export function parseAttachmentsFromJson(raw: Json | null): EmailAttachment[] {
  if (raw === null || raw === undefined) return [];
  let parsed: Json;
  if (typeof raw === "string") {
    try {
      parsed = jsonParse(raw);
    } catch {
      return [];
    }
  } else {
    parsed = raw;
  }
  if (!Array.isArray(parsed)) return [];
  const result: EmailAttachment[] = [];
  for (const item of parsed) {
    const attachment = itemToEmailAttachment(item);
    if (attachment) result.push(attachment);
  }
  return result;
}

/** Parses a JSON string; return type is Json (JSON.parse is typed as any in TS). */
function jsonParse(s: string): Json {
  return JSON.parse(s);
}

function itemToEmailAttachment(item: Json): EmailAttachment | null {
  if (item === null || typeof item !== "object" || Array.isArray(item))
    return null;
  if (
    !("id" in item) ||
    !("filename" in item) ||
    !("type" in item) ||
    !("url" in item)
  )
    return null;
  const id = item.id;
  const filename = item.filename;
  const type = item.type;
  const url = item.url;
  const path = "path" in item ? item.path : undefined;
  const size = "size" in item ? item.size : undefined;
  if (
    typeof id !== "string" ||
    typeof filename !== "string" ||
    typeof type !== "string" ||
    typeof url !== "string"
  )
    return null;
  return {
    id,
    filename,
    type,
    url,
    path: typeof path === "string" ? path : undefined,
    size: typeof size === "number" ? size : undefined,
  };
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

// CreateCategoryInput represents the structure to create a category (user_id set by backend from auth)
export interface CreateCategoryInput {
  name: string;
  color?: string | null;
}
