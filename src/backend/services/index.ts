/**
 * Service Provider / Factory
 * 
 * This module provides a centralized way to access database, storage, and auth services.
 * It uses dependency injection to allow easy swapping of implementations.
 */

import { supabase } from '@/integrations/supabase/client';
import { IDatabaseService } from './database.types';
import { SupabaseDatabaseService } from './database.supabase';
import { IStorageService } from './storage.types';
import { SupabaseStorageService } from './storage.supabase';
import { IAuthService } from './auth.types';
import { SupabaseAuthService } from './auth.supabase';

// Service instances (singletons)
let databaseService: IDatabaseService | null = null;
let storageService: IStorageService | null = null;
let authService: IAuthService | null = null;

/**
 * Initialize services with Supabase implementation
 * This can be called during app startup to set up services
 */
export function initializeServices() {
  if (!databaseService) {
    databaseService = new SupabaseDatabaseService(supabase);
  }
  if (!storageService) {
    storageService = new SupabaseStorageService(supabase);
  }
  if (!authService) {
    authService = new SupabaseAuthService(supabase);
  }
}

/**
 * Get the database service instance
 * Initializes if not already initialized
 */
export function getDatabaseService(): IDatabaseService {
  if (!databaseService) {
    databaseService = new SupabaseDatabaseService(supabase);
  }
  return databaseService;
}

/**
 * Get the storage service instance
 * Initializes if not already initialized
 */
export function getStorageService(): IStorageService {
  if (!storageService) {
    storageService = new SupabaseStorageService(supabase);
  }
  return storageService;
}

/**
 * Get the auth service instance
 * Initializes if not already initialized
 */
export function getAuthService(): IAuthService {
  if (!authService) {
    authService = new SupabaseAuthService(supabase);
  }
  return authService;
}

/**
 * Set custom service implementations (useful for testing or migration)
 */
export function setDatabaseService(service: IDatabaseService) {
  databaseService = service;
}

export function setStorageService(service: IStorageService) {
  storageService = service;
}

export function setAuthService(service: IAuthService) {
  authService = service;
}

// Auto-initialize on module load
initializeServices();
