import { RequisitionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateRequestItemDto } from './create-request-item.dto';

export class CreateRequisitionDto {
  @IsString()
  requesterId!: string;

  @IsString()
  departmentId!: string;

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
  dateRequested!: string;

  @IsDateString()
  dateNeeded!: string;

  @IsString()
  purpose!: string;

  @IsString()
  @IsOptional()
  currency?: string = 'PHP';

  @IsEnum(RequisitionStatus)
  @IsOptional()
  status?: RequisitionStatus = RequisitionStatus.DRAFT;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequestItemDto)
  items!: CreateRequestItemDto[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  fileIds?: string[];
}
