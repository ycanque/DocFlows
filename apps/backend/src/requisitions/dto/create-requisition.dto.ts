import { RequisitionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateRequestItemDto } from './create-request-item.dto';

export class CreateRequisitionDto {
  @IsString()
  requesterId!: string;

  @IsString()
  departmentId!: string;

  @IsDateString()
  dateRequested!: string;

  @IsDateString()
  dateNeeded!: string;

  @IsString()
  purpose!: string;

  @IsEnum(RequisitionStatus)
  @IsOptional()
  status?: RequisitionStatus = RequisitionStatus.DRAFT;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequestItemDto)
  items!: CreateRequestItemDto[];
}
