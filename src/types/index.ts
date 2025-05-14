export interface Attachment {
  id: string;
  filename: string;
  type: string;
  url: string;
  path?: string;
  size?: number;
}

export interface Email {
  id: string;
  from?: string;
  to?: string;
  sender?: string;
  recipient?: string;
  subject: string;
  body?: string;
  content?: string;
  date: string;
  time: string;
  hasAttachments?: boolean;
  attachments?: Attachment[]; // Attachments array can be undefined
  case_id?: string;
  user_id?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  type: "event";
  case_id?: string;
  created_at?: string;
  event_type?: string;
  user_id?: string;
}

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

export interface CreateEmailInput {
  id: string;
  attachments?: Attachment[]; // Attachments field is optional
  case_id: string;
  content: string;
  date: string;
  recipient: string;
  sender: string;
  subject: string;
  time: string;
  user_id: string;
}
