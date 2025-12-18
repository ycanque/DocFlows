import { Module } from '@nestjs/common';
import { BankAccountsService, PaymentsService, CheckVouchersService, ChecksService } from './index';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [BankAccountsService, PaymentsService, CheckVouchersService, ChecksService],
  exports: [BankAccountsService, PaymentsService, CheckVouchersService, ChecksService],
})
export class PaymentsModule {}
