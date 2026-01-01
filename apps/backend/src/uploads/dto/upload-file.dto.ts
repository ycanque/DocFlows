import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UploadFileDto {
  @IsString()
  @IsOptional()
  bucket?: string;

  @IsString()
  @IsOptional()
  folder?: string;

  @IsString()
  @IsOptional()
  workflowStep?: string;

  @IsString()
  @IsOptional()
  requisitionId?: string;

  @IsString()
  @IsOptional()
  paymentId?: string;
}

export class FileResponseDto {
  id: string;
  fileName: string;
  originalFileName: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  url?: string;
  uploadedAt: Date;
  workflowStep?: string;
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export class ListFilesDto {
  @IsString()
  @IsOptional()
  bucket?: string;

  @IsString()
  @IsOptional()
  folder?: string;
}

export class DeleteFileDto {
  @IsString()
  id: string;
}
