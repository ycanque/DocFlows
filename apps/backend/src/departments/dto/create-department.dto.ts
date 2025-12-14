import { IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsString()
  @IsOptional()
  headOfDepartmentId?: string;
}
