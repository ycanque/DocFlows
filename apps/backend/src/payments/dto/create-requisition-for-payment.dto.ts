import { IsString, IsOptional, IsDate, IsNumber, IsUUID, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRequisitionForPaymentDto {
  @IsUUID()
  @IsOptional()
  requisitionSlipId?: string;

  @IsUUID()
  requesterId: string;

  @IsUUID()
  departmentId: string;

  @IsString()
  seriesCode: string;

  @IsDate()
  @Type(() => Date)
  dateRequested: Date;

  @IsDate()
  @Type(() => Date)
  dateNeeded: Date;

  @IsString()
  payee: string;

  @IsString()
  particulars: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  fileIds?: string[];
}
