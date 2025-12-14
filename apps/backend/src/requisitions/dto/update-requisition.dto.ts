import { RequisitionStatus } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateRequestItemDto } from './create-request-item.dto';

export class UpdateRequisitionDto {
  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsDateString()
  @IsOptional()
  dateRequested?: string;

  @IsDateString()
  @IsOptional()
  dateNeeded?: string;

  @IsString()
  @IsOptional()
  purpose?: string;

  @IsEnum(RequisitionStatus)
  @IsOptional()
  status?: RequisitionStatus;

  @IsArray()
  @IsOptional()
  items?: CreateRequestItemDto[];
}
