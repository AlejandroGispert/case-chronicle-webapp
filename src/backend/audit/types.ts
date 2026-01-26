/**
 * Audit Log Types
 * 
 * Defines types for audit logging system.
 * Logs are append-only and contain NO PII.
 */

export type AuditAction =
  | 'login'
  | 'logout'
  | 'data_create'
  | 'data_update'
  | 'data_delete'
  | 'data_read'
  | 'permission_change'
  | 'file_upload'
  | 'file_download'
  | 'data_export'
  | 'data_deletion'
  | 'access_denied'
  | 'error';

export type AuditResourceType =
  | 'case'
  | 'email'
  | 'event'
  | 'contact'
  | 'document'
  | 'profile'
  | 'user'
  | 'session';

export interface AuditLog {
  id?: string;
  user_id: string | null; // null for system actions
  action: AuditAction;
  resource_type: AuditResourceType | null;
  resource_id: string | null;
  timestamp: string; // ISO 8601 format
  request_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, any>; // No PII allowed
  success: boolean;
  error_message?: string | null;
}

export interface CreateAuditLogInput {
  user_id: string | null;
  action: AuditAction;
  resource_type?: AuditResourceType | null;
  resource_id?: string | null;
  request_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, any>;
  success: boolean;
  error_message?: string | null;
}
