import { IsString, IsOptional } from 'class-validator';

export class CreateCheckVoucherDto {
  @IsString()
  @IsOptional()
  cvNumber?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}
