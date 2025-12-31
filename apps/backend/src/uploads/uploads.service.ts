import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from './supabase.service';
import { FileResponseDto } from './dto/upload-file.dto';

@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  /**
   * Upload a file and save metadata to database
   */
  async uploadFile(
    userId: string,
    file: Express.Multer.File,
    bucket: string = 'documents',
    folder?: string,
  ): Promise<FileResponseDto> {
    try {
      // Generate unique file name
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${timestamp}_${safeName}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload to Supabase Storage
      await this.supabase.uploadFile(bucket, filePath, file.buffer, file.mimetype);

      // Save metadata to database
      const fileUpload = await this.prisma.fileUpload.create({
        data: {
          userId,
          fileName,
          originalFileName: file.originalname,
          bucketName: bucket,
          storagePath: filePath,
          fileSize: BigInt(file.size),
          mimeType: file.mimetype,
          status: 'COMPLETED',
        },
      });

      // Get public URL
      const url = this.supabase.getPublicUrl(bucket, filePath);

      return {
        id: fileUpload.id,
        fileName: fileUpload.fileName,
        originalFileName: fileUpload.originalFileName,
        storagePath: fileUpload.storagePath,
        fileSize: Number(fileUpload.fileSize),
        mimeType: fileUpload.mimeType,
        url,
        uploadedAt: fileUpload.uploadedAt,
      };
    } catch (error) {
      throw new BadRequestException(
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * List all files for a user
   */
  async listUserFiles(userId: string, bucket?: string): Promise<FileResponseDto[]> {
    const files = await this.prisma.fileUpload.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        ...(bucket && { bucketName: bucket }),
        deletedAt: null,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return files.map((file) => ({
      id: file.id,
      fileName: file.fileName,
      originalFileName: file.originalFileName,
      storagePath: file.storagePath,
      fileSize: Number(file.fileSize),
      mimeType: file.mimeType,
      url: this.supabase.getPublicUrl(file.bucketName, file.storagePath),
      uploadedAt: file.uploadedAt,
    }));
  }

  /**
   * Get a single file by ID
   */
  async getFile(fileId: string, userId: string): Promise<FileResponseDto> {
    const file = await this.prisma.fileUpload.findFirst({
      where: {
        id: fileId,
        userId,
        deletedAt: null,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return {
      id: file.id,
      fileName: file.fileName,
      originalFileName: file.originalFileName,
      storagePath: file.storagePath,
      fileSize: Number(file.fileSize),
      mimeType: file.mimeType,
      url: this.supabase.getPublicUrl(file.bucketName, file.storagePath),
      uploadedAt: file.uploadedAt,
    };
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    const file = await this.prisma.fileUpload.findFirst({
      where: {
        id: fileId,
        userId,
        deletedAt: null,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    try {
      // Delete from Supabase Storage
      await this.supabase.deleteFile(file.bucketName, file.storagePath);

      // Mark as deleted in database (soft delete)
      await this.prisma.fileUpload.update({
        where: { id: fileId },
        data: {
          status: 'DELETED',
          deletedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      throw new BadRequestException(
        `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get signed URL for a file
   */
  async getSignedUrl(fileId: string, userId: string, expiresIn: number = 3600): Promise<string> {
    const file = await this.prisma.fileUpload.findFirst({
      where: {
        id: fileId,
        userId,
        deletedAt: null,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return this.supabase.getSignedUrl(file.bucketName, file.storagePath, expiresIn);
  }

  /**
   * Download a file
   */
  async downloadFile(fileId: string, userId: string): Promise<Blob> {
    const file = await this.prisma.fileUpload.findFirst({
      where: {
        id: fileId,
        userId,
        deletedAt: null,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return this.supabase.downloadFile(file.bucketName, file.storagePath);
  }
}
