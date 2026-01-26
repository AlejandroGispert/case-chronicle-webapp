/**
 * Audit Logger
 * 
 * Centralized audit logging system.
 * 
 * Rules:
 * - Logs are append-only
 * - Logs contain NO PII
 * - All sensitive operations MUST be audit-logged
 * 
 * Log Events:
 * - Login / logout
 * - Data create / update / delete
 * - Permission changes
 * - File upload / download
 * - Data export / deletion (GDPR)
 */

import { getDatabaseService } from '../services';
import type { AuditLog, CreateAuditLogInput, AuditAction, AuditResourceType } from './types';

/**
 * Sanitize metadata to ensure no PII is logged
 */
function sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
  if (!metadata) return undefined;

  const piiFields = [
    'email',
    'password',
    'ssn',
    'credit_card',
    'phone',
    'address',
    'first_name',
    'last_name',
    'name',
  ];

  const sanitized = { ...metadata };

  for (const field of piiFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeMetadata(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Create an audit log entry
 * 
 * @param input - Audit log data
 * @returns The created audit log or null if logging fails
 */
export async function logAuditEvent(input: CreateAuditLogInput): Promise<AuditLog | null> {
  try {
    const db = getDatabaseService();

    const auditLog: Omit<AuditLog, 'id'> = {
      user_id: input.user_id,
      action: input.action,
      resource_type: input.resource_type || null,
      resource_id: input.resource_id || null,
      timestamp: new Date().toISOString(),
      request_id: input.request_id || null,
      ip_address: input.ip_address || null,
      user_agent: input.user_agent || null,
      metadata: sanitizeMetadata(input.metadata),
      success: input.success,
      error_message: input.error_message || null,
    };

    // Try to insert into audit_logs table
    // If table doesn't exist, log to console as fallback
    try {
      const { data, error } = await db
        .from<AuditLog>('audit_logs')
        .insert(auditLog)
        .select()
        .single();

      if (error) {
        // Fallback to console if database insert fails
        console.warn('[Audit] Failed to write to database:', error.message);
        console.log('[Audit]', JSON.stringify(auditLog, null, 2));
        return null;
      }

      return data;
    } catch (dbError) {
      // Table might not exist yet - log to console
      console.warn('[Audit] Database table not available, logging to console');
      console.log('[Audit]', JSON.stringify(auditLog, null, 2));
      return null;
    }
  } catch (error) {
    console.error('[Audit] Failed to create audit log:', error);
    return null;
  }
}

/**
 * Log a successful action
 */
export async function logSuccess(
  user_id: string | null,
  action: AuditAction,
  options?: {
    resource_type?: AuditResourceType | null;
    resource_id?: string | null;
    request_id?: string | null;
    ip_address?: string | null;
    user_agent?: string | null;
    metadata?: Record<string, any>;
  }
): Promise<AuditLog | null> {
  return logAuditEvent({
    user_id,
    action,
    resource_type: options?.resource_type || null,
    resource_id: options?.resource_id || null,
    request_id: options?.request_id || null,
    ip_address: options?.ip_address || null,
    user_agent: options?.user_agent || null,
    metadata: options?.metadata,
    success: true,
  });
}

/**
 * Log a failed action
 */
export async function logFailure(
  user_id: string | null,
  action: AuditAction,
  error_message: string,
  options?: {
    resource_type?: AuditResourceType | null;
    resource_id?: string | null;
    request_id?: string | null;
    ip_address?: string | null;
    user_agent?: string | null;
    metadata?: Record<string, any>;
  }
): Promise<AuditLog | null> {
  return logAuditEvent({
    user_id,
    action,
    resource_type: options?.resource_type || null,
    resource_id: options?.resource_id || null,
    request_id: options?.request_id || null,
    ip_address: options?.ip_address || null,
    user_agent: options?.user_agent || null,
    metadata: options?.metadata,
    success: false,
    error_message,
  });
}

/**
 * Get request context from browser (if available)
 */
export function getRequestContext(): {
  ip_address?: string;
  user_agent?: string;
} {
  // In a browser environment, we can get user agent
  // IP address would need to come from server-side
  if (typeof window !== 'undefined') {
    return {
      user_agent: window.navigator.userAgent,
      // IP address not available client-side
    };
  }

  return {};
}
