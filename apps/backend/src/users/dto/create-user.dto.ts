import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'User password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ description: 'User first name' })
  @IsString()
  firstName!: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  lastName!: string;

  @ApiPropertyOptional({ description: 'User role', enum: UserRole, default: UserRole.REQUESTER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.REQUESTER;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Whether user is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
