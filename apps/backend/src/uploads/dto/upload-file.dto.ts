import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UploadFileDto {
  @IsString()
  @IsOptional()
  bucket?: string;

  @IsString()
  @IsOptional()
  folder?: string;
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
