import { PartialType } from '@nestjs/swagger';
import { CreateRequisitionForPaymentDto } from './create-requisition-for-payment.dto';

export class UpdateRequisitionForPaymentDto extends PartialType(CreateRequisitionForPaymentDto) {}
