import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRequestItemDto {
  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsString()
  unit!: string;

  @IsString()
  particulars!: string;

  @IsString()
  @IsOptional()
  specification?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  unitCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  subtotal?: number;
}
