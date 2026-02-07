/**
 * Supabase Storage implementation of IStorageService
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { IStorageService, UploadOptions, StorageFile, StorageFileMetadata } from "./storage.types";

export class SupabaseStorageService implements IStorageService {
  constructor(private client: SupabaseClient) {}

  async upload(
    bucket: string,
    path: string,
    file: File | Blob,
    options?: UploadOptions
  ): Promise<{ data: { path: string } | null; error: Error | null }> {
    try {
      const uploadOptions: { cacheControl?: string; contentType?: string; upsert?: boolean } = {};
      if (options?.cacheControl) uploadOptions.cacheControl = options.cacheControl;
      if (options?.contentType) uploadOptions.contentType = options.contentType;
      if (options?.upsert !== undefined) uploadOptions.upsert = options.upsert;

      const result = await this.client.storage.from(bucket).upload(path, file, uploadOptions);

      if (result.error) {
        return {
          data: null,
          error: new Error(result.error.message),
        };
      }

      return {
        data: { path: result.data.path },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown upload error'),
      };
    }
  }

  async download(bucket: string, path: string): Promise<{ data: Blob | null; error: Error | null }> {
    try {
      const result = await this.client.storage.from(bucket).download(path);

      if (result.error) {
        return {
          data: null,
          error: new Error(result.error.message),
        };
      }

      return {
        data: result.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown download error'),
      };
    }
  }

  getPublicUrl(bucket: string, path: string): { publicUrl: string } {
    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return {
      publicUrl: data.publicUrl,
    };
  }

  async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
  ): Promise<{ data: { signedUrl: string } | null; error: Error | null }> {
    try {
      const result = await this.client.storage.from(bucket).createSignedUrl(path, expiresIn);

      if (result.error) {
        return {
          data: null,
          error: new Error(result.error.message),
        };
      }

      return {
        data: { signedUrl: result.data.signedUrl },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown signed URL error'),
      };
    }
  }

  async list(
    bucket: string,
    path: string = '',
    options?: {
      limit?: number;
      offset?: number;
      sortBy?: { column: string; order: 'asc' | 'desc' };
    }
  ): Promise<{ data: StorageFile[] | null; error: Error | null }> {
    try {
      const listOptions: {
        limit?: number;
        offset?: number;
        sortBy?: { column: string; order: "asc" | "desc" };
      } = {};
      if (options?.limit) listOptions.limit = options.limit;
      if (options?.offset) listOptions.offset = options.offset;
      if (options?.sortBy) {
        listOptions.sortBy = {
          column: options.sortBy.column,
          order: options.sortBy.order,
        };
      }

      const result = await this.client.storage.from(bucket).list(path, listOptions);

      if (result.error) {
        return {
          data: null,
          error: new Error(result.error.message),
        };
      }

      const supabaseFiles = result.data ?? [];
      const files: StorageFile[] = supabaseFiles.map((file) => {
        const meta = file.metadata ?? {};
        const metadata: StorageFileMetadata =
          typeof meta === "object" && meta !== null
            ? { size: typeof meta.size === "number" ? meta.size : undefined, mimetype: typeof meta.mimetype === "string" ? meta.mimetype : undefined }
            : {};
        return {
          name: file.name,
          id: file.id ?? file.name,
          updated_at: file.updated_at ?? new Date().toISOString(),
          created_at: file.created_at ?? new Date().toISOString(),
          last_accessed_at: file.last_accessed_at ?? new Date().toISOString(),
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        };
      });

      return {
        data: files,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown list error'),
      };
    }
  }

  async remove(bucket: string, paths: string[]): Promise<{ data: { paths: string[] } | null; error: Error | null }> {
    try {
      const result = await this.client.storage.from(bucket).remove(paths);

      if (result.error) {
        return {
          data: null,
          error: new Error(result.error.message),
        };
      }

      return {
        data: { paths: result.data || paths },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown remove error'),
      };
    }
  }

  async move(
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<{ data: { path: string } | null; error: Error | null }> {
    try {
      const result = await this.client.storage.from(bucket).move(fromPath, toPath);

      if (result.error) {
        return {
          data: null,
          error: new Error(result.error.message),
        };
      }

      return {
        data: { path: toPath },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown move error'),
      };
    }
  }

  async copy(
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<{ data: { path: string } | null; error: Error | null }> {
    try {
      const result = await this.client.storage.from(bucket).copy(fromPath, toPath);

      if (result.error) {
        return {
          data: null,
          error: new Error(result.error.message),
        };
      }

      return {
        data: { path: toPath },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown copy error'),
      };
    }
  }
}
