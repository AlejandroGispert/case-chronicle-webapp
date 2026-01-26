/**
 * Audit Logging Module
 * 
 * Centralized audit logging for compliance (ISO 27001 / GDPR).
 * 
 * Usage:
 * ```ts
 * import { logSuccess, logFailure } from '@/backend/audit';
 * 
 * // Log successful action
 * await logSuccess(user.id, 'data_create', {
 *   resource_type: 'case',
 *   resource_id: caseId,
 * });
 * 
 * // Log failed action
 * await logFailure(user.id, 'data_create', 'Failed to create case', {
 *   resource_type: 'case',
 * });
 * ```
 */

export * from './types';
export * from './auditLogger';
export { logSuccess, logFailure, getRequestContext } from './auditLogger';
