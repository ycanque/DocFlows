import { IsString, IsOptional, IsDate, IsDecimal, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRequisitionForPaymentDto {
  @IsUUID()
  @IsOptional()
  requisitionSlipId?: string;

  @IsString()
  seriesCode: string;

  @IsDate()
  @Type(() => Date)
  dateNeeded: Date;

  @IsString()
  payee: string;

  @IsString()
  particulars: string;

  @IsDecimal({ decimal_digits: '2' })
  amount: number;
}
