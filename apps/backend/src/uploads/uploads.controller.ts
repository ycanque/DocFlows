import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  Query,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';
import { UploadFileDto, ListFilesDto } from './dto/upload-file.dto';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * Upload a file
   * POST /uploads
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 50MB limit');
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX');
    }

    const bucket = dto.bucket || 'documents';
    const folder = dto.folder;
    const workflowStep = dto.workflowStep;
    const requisitionId = dto.requisitionId;

    return this.uploadsService.uploadFile(
      req.user.id,
      file,
      bucket,
      folder,
      workflowStep,
      requisitionId,
    );
  }

  /**
   * List user's files
   * GET /uploads
   */
  @Get()
  async listFiles(@Request() req, @Query() query: ListFilesDto) {
    return this.uploadsService.listUserFiles(req.user.id, query.bucket);
  }

  /**
   * List files for a requisition
   * GET /uploads/requisition/:requisitionId
   */
  @Get('requisition/:requisitionId')
  async listRequisitionFiles(@Param('requisitionId') requisitionId: string) {
    return this.uploadsService.listRequisitionFiles(requisitionId);
  }

  /**
   * Get a single file
   * GET /uploads/:id
   */
  @Get(':id')
  async getFile(@Param('id') id: string, @Request() req) {
    return this.uploadsService.getFile(id, req.user.id);
  }

  /**
   * Delete a file
   * DELETE /uploads/:id
   */
  @Delete(':id')
  async deleteFile(@Param('id') id: string, @Request() req) {
    await this.uploadsService.deleteFile(id, req.user.id);
    return { success: true, message: 'File deleted successfully' };
  }

  /**
   * Get signed URL for a file
   * GET /uploads/:id/signed-url
   */
  @Get(':id/signed-url')
  async getSignedUrl(
    @Param('id') id: string,
    @Query('expiresIn') expiresIn: string,
    @Request() req,
  ) {
    const expires = expiresIn ? parseInt(expiresIn, 10) : 3600;
    const url = await this.uploadsService.getSignedUrl(id, req.user.id, expires);
    return { url, expiresIn: expires };
  }

  /**
   * Download a file
   * GET /uploads/:id/download
   */
  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Request() req) {
    const blob = await this.uploadsService.downloadFile(id, req.user.id);
    return blob;
  }
}
