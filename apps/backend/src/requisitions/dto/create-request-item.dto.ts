import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRequestItemDto {
  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  unit!: string;

  @IsString()
  particulars!: string;

  @IsNumber()
  @IsOptional()
  estimatedCost?: number;
}
