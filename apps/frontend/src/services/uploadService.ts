/**
 * Upload Service
 *
 * Handles file uploads via backend API
 * Backend manages Supabase Storage interaction with proper security
 */

import api from "@/lib/api";

export interface UploadedFile {
  id: string;
  fileName: string;
  originalFileName: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  url?: string;
  uploadedAt: string;
  workflowStep?: string; // e.g., "CREATED", "SUBMITTED", "APPROVED", "REJECTED"
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface UploadResult {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}

/**
 * Upload a file via backend API
 *
 * @param file - The file to upload
 * @param bucket - The storage bucket name (default: 'documents')
 * @param folder - Optional folder within the bucket
 * @param workflowStep - Optional workflow step to associate with the file
 * @param requisitionId - Optional requisition ID to associate the file with
 * @returns Upload result with file data or error
 */
export const uploadFile = async (
  file: File,
  bucket: string = "documents",
  folder?: string,
  workflowStep?: string,
  requisitionId?: string
): Promise<UploadResult> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (bucket) formData.append("bucket", bucket);
    if (folder) formData.append("folder", folder);
    if (workflowStep) formData.append("workflowStep", workflowStep);
    if (requisitionId) formData.append("requisitionId", requisitionId);

    const response = await api.post<UploadedFile>("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return { success: true, file: response.data };
  } catch (error: any) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Upload failed",
    };
  }
};

/**
 * List all files for the current user
 *
 * @param bucket - The storage bucket name (optional filter)
 * @returns Array of uploaded files
 */
export const listFiles = async (bucket?: string): Promise<UploadedFile[]> => {
  try {
    const params = bucket ? { bucket } : {};
    const response = await api.get<UploadedFile[]>("/uploads", { params });
    return response.data;
  } catch (error) {
    console.error("List files error:", error);
    return [];
  }
};

/**
 * List files for a specific requisition
 *
 * @param requisitionId - The requisition ID
 * @returns Array of uploaded files for this requisition
 */
export const listRequisitionFiles = async (
  requisitionId: string
): Promise<UploadedFile[]> => {
  try {
    const response = await api.get<UploadedFile[]>(
      `/uploads/requisition/${requisitionId}`
    );
    return response.data;
  } catch (error) {
    console.error("List requisition files error:", error);
    return [];
  }
};

/**
 * Delete a file by ID
 *
 * @param fileId - The file ID
 * @returns Success status
 */
export const deleteFile = async (fileId: string): Promise<boolean> => {
  try {
    await api.delete(`/uploads/${fileId}`);
    return true;
  } catch (error) {
    console.error("Delete error:", error);
    return false;
  }
};

/**
 * Get a file by ID
 *
 * @param fileId - The file ID
 * @returns File data or null
 */
export const getFile = async (fileId: string): Promise<UploadedFile | null> => {
  try {
    const response = await api.get<UploadedFile>(`/uploads/${fileId}`);
    return response.data;
  } catch (error) {
    console.error("Get file error:", error);
    return null;
  }
};

/**
 * Get a signed (temporary) URL for a file
 *
 * @param fileId - The file ID
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL or null
 */
export const getSignedUrl = async (
  fileId: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const response = await api.get<{ url: string; expiresIn: number }>(
      `/uploads/${fileId}/signed-url`,
      { params: { expiresIn } }
    );
    return response.data.url;
  } catch (error) {
    console.error("Get signed URL error:", error);
    return null;
  }
};

/**
 * Download a file
 *
 * @param fileId - The file ID
 * @returns Blob or null
 */
export const downloadFile = async (fileId: string): Promise<Blob | null> => {
  try {
    const response = await api.get(`/uploads/${fileId}/download`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Download error:", error);
    return null;
  }
};
