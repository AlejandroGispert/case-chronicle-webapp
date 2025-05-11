
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
  sender?: string; // Using either sender/recipient or from/to
  recipient?: string;
  subject: string;
  body?: string;
  content?: string; // Using either body or content
  date: string;
  time: string;
  hasAttachments?: boolean;
  attachments?: Attachment[];
  case_id?: string;
  user_id?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  type: 'event';
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
  status: 'active' | 'pending' | 'closed';
  dateCreated: string;
  emails: Email[];
  events: Event[];
}