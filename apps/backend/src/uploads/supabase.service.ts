import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(bucket: string, filePath: string, file: Buffer, contentType: string) {
    const { data, error } = await this.supabase.storage.from(bucket).upload(filePath, file, {
      contentType,
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(bucket: string, filePath: string) {
    const { error } = await this.supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    return true;
  }

  /**
   * List files in a bucket
   */
  async listFiles(bucket: string, folder?: string) {
    const { data, error } = await this.supabase.storage.from(bucket).list(folder || '', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      throw new Error(`List files failed: ${error.message}`);
    }

    return data;
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, filePath: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  /**
   * Get signed (temporary) URL for a private file
   */
  async getSignedUrl(bucket: string, filePath: string, expiresIn: number = 3600) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Get signed URL failed: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Download a file
   */
  async downloadFile(bucket: string, filePath: string) {
    const { data, error } = await this.supabase.storage.from(bucket).download(filePath);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a storage bucket
   */
  async createBucket(bucketName: string, isPublic: boolean = false) {
    const { error } = await this.supabase.storage.createBucket(bucketName, {
      public: isPublic,
      fileSizeLimit: 52428800, // 50MB
    });

    if (error) {
      throw new Error(`Create bucket failed: ${error.message}`);
    }

    return true;
  }
}
