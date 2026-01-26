/**
 * Authorization Helpers
 * 
 * These helpers enforce authorization rules in controllers.
 * Authentication ≠ Authorization
 * 
 * Authorization decisions happen ONLY in controllers.
 * Never rely solely on RLS for business logic.
 */

import type { User } from '../services/auth.types';

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Require that a user is authenticated
 * @throws {AuthorizationError} if user is not authenticated
 */
export function requireAuth(user: User | null): asserts user is User {
  if (!user) {
    throw new AuthorizationError('Authentication required');
  }
}

/**
 * Require that a user has a specific role
 * @throws {AuthorizationError} if user doesn't have the required role
 */
export function requireRole(user: User | null, role: string): asserts user is User {
  requireAuth(user);
  
  // Check if user has the role in their metadata
  const userRoles = (user as any).role || (user as any).roles || [];
  const roles = Array.isArray(userRoles) ? userRoles : [userRoles];
  
  if (!roles.includes(role)) {
    throw new AuthorizationError(`Role '${role}' required`);
  }
}

/**
 * Require that a user owns a resource
 * @throws {AuthorizationError} if user doesn't own the resource
 */
export function requireOwnership(
  resourceUserId: string | null | undefined,
  userId: string
): void {
  if (!resourceUserId) {
    throw new AuthorizationError('Resource ownership cannot be determined');
  }
  
  if (resourceUserId !== userId) {
    throw new AuthorizationError('Access denied: Resource ownership required');
  }
}

/**
 * Check if a user owns a resource (non-throwing version)
 * @returns true if user owns the resource, false otherwise
 */
export function isOwner(
  resourceUserId: string | null | undefined,
  userId: string
): boolean {
  if (!resourceUserId) {
    return false;
  }
  
  return resourceUserId === userId;
}

/**
 * Require that a user has one of the specified roles
 * @throws {AuthorizationError} if user doesn't have any of the required roles
 */
export function requireAnyRole(
  user: User | null,
  roles: string[]
): asserts user is User {
  requireAuth(user);
  
  const userRoles = (user as any).role || (user as any).roles || [];
  const userRolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
  
  const hasRole = roles.some(role => userRolesArray.includes(role));
  
  if (!hasRole) {
    throw new AuthorizationError(`One of the following roles required: ${roles.join(', ')}`);
  }
}

/**
 * Require that a user has all of the specified roles
 * @throws {AuthorizationError} if user doesn't have all required roles
 */
export function requireAllRoles(
  user: User | null,
  roles: string[]
): asserts user is User {
  requireAuth(user);
  
  const userRoles = (user as any).role || (user as any).roles || [];
  const userRolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
  
  const hasAllRoles = roles.every(role => userRolesArray.includes(role));
  
  if (!hasAllRoles) {
    throw new AuthorizationError(`All of the following roles required: ${roles.join(', ')}`);
  }
}
