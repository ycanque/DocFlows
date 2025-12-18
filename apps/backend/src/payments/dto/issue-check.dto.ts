import { IsString, IsUUID } from 'class-validator';

export class IssueCheckDto {
  @IsString()
  checkNumber: string;

  @IsUUID()
  bankAccountId: string;
}
