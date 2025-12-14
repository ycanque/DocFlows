import { Module } from '@nestjs/common';
import { RequisitionsService } from './requisitions.service';
import { RequisitionsController } from './requisitions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RequisitionsController],
  providers: [RequisitionsService],
})
export class RequisitionsModule {}
