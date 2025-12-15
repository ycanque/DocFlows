import { RequisitionStatus } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateRequestItemDto } from './create-request-item.dto';

export class UpdateRequisitionDto {
  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  costCenterId?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  businessUnitId?: string;

  @IsDateString()
  @IsOptional()
  dateRequested?: string;

  @IsDateString()
  @IsOptional()
  dateNeeded?: string;

  @IsString()
  @IsOptional()
  purpose?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(RequisitionStatus)
  @IsOptional()
  status?: RequisitionStatus;

  @IsArray()
  @IsOptional()
  items?: CreateRequestItemDto[];
}
