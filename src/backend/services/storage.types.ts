/**
 * Storage Abstraction Layer
 * 
 * This interface allows swapping storage implementations without changing business logic.
 * Currently implemented for Supabase Storage, but can be extended to support:
 * - AWS S3
 * - Cloudflare R2
 * - Google Cloud Storage
 * - Azure Blob Storage
 * - Local file system (for development)
 */

export interface UploadOptions {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
  metadata?: Record<string, string>;
}

export interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata?: {
    size?: number;
    mimetype?: string;
    [key: string]: any;
  };
}

export interface IStorageService {
  /**
   * Upload a file to storage
   */
  upload(
    bucket: string,
    path: string,
    file: File | Blob,
    options?: UploadOptions
  ): Promise<{ data: { path: string } | null; error: Error | null }>;

  /**
   * Download a file from storage
   */
  download(bucket: string, path: string): Promise<{ data: Blob | null; error: Error | null }>;

  /**
   * Get a public URL for a file
   */
  getPublicUrl(bucket: string, path: string): { publicUrl: string };

  /**
   * Get a signed URL for a file (temporary access)
   */
  getSignedUrl(
    bucket: string,
    path: string,
    expiresIn?: number
  ): Promise<{ data: { signedUrl: string } | null; error: Error | null }>;

  /**
   * List files in a bucket/folder
   */
  list(
    bucket: string,
    path?: string,
    options?: {
      limit?: number;
      offset?: number;
      sortBy?: { column: string; order: 'asc' | 'desc' };
    }
  ): Promise<{ data: StorageFile[] | null; error: Error | null }>;

  /**
   * Delete a file from storage
   */
  remove(bucket: string, paths: string[]): Promise<{ data: { paths: string[] } | null; error: Error | null }>;

  /**
   * Move/rename a file
   */
  move(
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<{ data: { path: string } | null; error: Error | null }>;

  /**
   * Copy a file
   */
  copy(
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<{ data: { path: string } | null; error: Error | null }>;
}
