/**
 * Authorization Module
 * 
 * Provides authorization helpers for controllers.
 * 
 * Usage:
 * ```ts
 * import { requireAuth, requireOwnership } from '@/backend/auth';
 * 
 * export const myController = {
 *   async fetchItem(itemId: string, user: User | null) {
 *     requireAuth(user);
 *     const item = await myModel.getItem(itemId);
 *     requireOwnership(item.user_id, user.id);
 *     return item;
 *   }
 * };
 * ```
 */

export * from './authorization';
export {
  requireAuth,
  requireRole,
  requireOwnership,
  isOwner,
  requireAnyRole,
  requireAllRoles,
  AuthorizationError,
} from './authorization';
