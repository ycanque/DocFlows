import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BankAccount, RequisitionForPayment, CheckVoucher, Check } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BankAccountsService, PaymentsService, CheckVouchersService, ChecksService } from './index';
import {
  CreateBankAccountDto,
  UpdateBankAccountDto,
  CreateRequisitionForPaymentDto,
  UpdateRequisitionForPaymentDto,
  CreateCheckVoucherDto,
  IssueCheckDto,
} from './dto';

interface RequestWithUser extends Request {
  user: { id: string; role: string; departmentId: string };
}

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(
    private readonly bankAccountsService: BankAccountsService,
    private readonly paymentsService: PaymentsService,
    private readonly checkVouchersService: CheckVouchersService,
    private readonly checksService: ChecksService,
  ) {}

  // ==================== BANK ACCOUNTS ====================

  @Post('bank-accounts')
  @ApiOperation({ summary: 'Create a new bank account' })
  @ApiResponse({ status: 201, description: 'Bank account created' })
  async createBankAccount(@Body() createDto: CreateBankAccountDto): Promise<BankAccount> {
    return this.bankAccountsService.create(createDto);
  }

  @Get('bank-accounts')
  @ApiOperation({ summary: 'Get all bank accounts' })
  @ApiResponse({ status: 200, description: 'List of bank accounts' })
  async getBankAccounts(): Promise<BankAccount[]> {
    return this.bankAccountsService.findAll();
  }

  @Get('bank-accounts/active')
  @ApiOperation({ summary: 'Get active bank accounts' })
  @ApiResponse({ status: 200, description: 'List of active bank accounts' })
  async getActiveBankAccounts(): Promise<BankAccount[]> {
    return this.bankAccountsService.findActive();
  }

  @Get('bank-accounts/:id')
  @ApiOperation({ summary: 'Get bank account by ID' })
  @ApiResponse({ status: 200, description: 'Bank account found' })
  async getBankAccount(@Param('id') id: string): Promise<BankAccount> {
    return this.bankAccountsService.findOne(id);
  }

  @Patch('bank-accounts/:id')
  @ApiOperation({ summary: 'Update bank account' })
  @ApiResponse({ status: 200, description: 'Bank account updated' })
  async updateBankAccount(
    @Param('id') id: string,
    @Body() updateDto: UpdateBankAccountDto,
  ): Promise<BankAccount> {
    return this.bankAccountsService.update(id, updateDto);
  }

  @Delete('bank-accounts/:id')
  @ApiOperation({ summary: 'Delete bank account' })
  @ApiResponse({ status: 200, description: 'Bank account deleted' })
  async deleteBankAccount(@Param('id') id: string): Promise<BankAccount> {
    return this.bankAccountsService.remove(id);
  }

  // ==================== REQUISITIONS FOR PAYMENT ====================

  @Post()
  @ApiOperation({ summary: 'Create requisition for payment' })
  @ApiResponse({ status: 201, description: 'RFP created' })
  async createRequisitionForPayment(
    @Body() createDto: CreateRequisitionForPaymentDto,
  ): Promise<RequisitionForPayment> {
    return this.paymentsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all requisitions for payment' })
  @ApiResponse({ status: 200, description: 'List of RFPs' })
  async getRequisitionsForPayment(
    @Query('status') status?: string,
    @Query('payee') payee?: string,
  ): Promise<RequisitionForPayment[]> {
    return this.paymentsService.findAll({
      status: status as any,
      payee,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get requisition for payment by ID' })
  @ApiResponse({ status: 200, description: 'RFP found' })
  async getRequisitionForPayment(@Param('id') id: string): Promise<RequisitionForPayment> {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update requisition for payment' })
  @ApiResponse({ status: 200, description: 'RFP updated' })
  async updateRequisitionForPayment(
    @Param('id') id: string,
    @Body() updateDto: UpdateRequisitionForPaymentDto,
  ): Promise<RequisitionForPayment> {
    return this.paymentsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete requisition for payment' })
  @ApiResponse({ status: 200, description: 'RFP deleted' })
  async deleteRequisitionForPayment(@Param('id') id: string): Promise<RequisitionForPayment> {
    return this.paymentsService.remove(id);
  }

  // ==================== WORKFLOW ACTIONS ====================

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit RFP for approval' })
  @ApiResponse({ status: 200, description: 'RFP submitted' })
  async submitRequisitionForPayment(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<RequisitionForPayment> {
    return this.paymentsService.submit(id, req.user.id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve RFP' })
  @ApiResponse({ status: 200, description: 'RFP approved' })
  async approveRequisitionForPayment(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<RequisitionForPayment> {
    return this.paymentsService.approve(id, req.user.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject RFP' })
  @ApiResponse({ status: 200, description: 'RFP rejected' })
  async rejectRequisitionForPayment(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: RequestWithUser,
  ): Promise<RequisitionForPayment> {
    return this.paymentsService.reject(id, req.user.id, reason);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel RFP' })
  @ApiResponse({ status: 200, description: 'RFP cancelled' })
  async cancelRequisitionForPayment(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<RequisitionForPayment> {
    return this.paymentsService.cancel(id, req.user.id);
  }

  // ==================== CHECK VOUCHERS ====================

  @Post(':id/create-cv')
  @ApiOperation({ summary: 'Generate check voucher from approved RFP' })
  @ApiResponse({ status: 201, description: 'Check Voucher created' })
  async generateCheckVoucher(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<CheckVoucher> {
    return this.checkVouchersService.generate(id, req.user.id);
  }

  @Get('check-vouchers/all')
  @ApiOperation({ summary: 'Get all check vouchers' })
  @ApiResponse({ status: 200, description: 'List of check vouchers' })
  async getCheckVouchers(): Promise<CheckVoucher[]> {
    return this.checkVouchersService.findAll();
  }

  @Get('check-vouchers/:id')
  @ApiOperation({ summary: 'Get check voucher by ID' })
  @ApiResponse({ status: 200, description: 'Check voucher found' })
  async getCheckVoucher(@Param('id') id: string): Promise<CheckVoucher> {
    return this.checkVouchersService.findOne(id);
  }

  @Patch('check-vouchers/:id/verify')
  @ApiOperation({ summary: 'Verify check voucher' })
  @ApiResponse({ status: 200, description: 'Check Voucher verified' })
  async verifyCheckVoucher(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<CheckVoucher> {
    return this.checkVouchersService.verify(id, req.user.id);
  }

  @Patch('check-vouchers/:id/approve')
  @ApiOperation({ summary: 'Approve check voucher' })
  @ApiResponse({ status: 200, description: 'Check Voucher approved' })
  async approveCheckVoucher(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<CheckVoucher> {
    return this.checkVouchersService.approve(id, req.user.id);
  }

  // ==================== CHECKS ====================

  @Post('check-vouchers/:id/issue-check')
  @ApiOperation({ summary: 'Issue check from check voucher' })
  @ApiResponse({ status: 201, description: 'Check issued' })
  async issueCheck(
    @Param('id') id: string,
    @Body() issueDto: IssueCheckDto,
    @Req() req: RequestWithUser,
  ): Promise<Check> {
    return this.checksService.issue(id, issueDto.bankAccountId, issueDto.checkNumber, req.user.id);
  }

  @Get('checks/all')
  @ApiOperation({ summary: 'Get all checks' })
  @ApiResponse({ status: 200, description: 'List of checks' })
  async getChecks(): Promise<Check[]> {
    return this.checksService.findAll();
  }

  @Get('checks/:id')
  @ApiOperation({ summary: 'Get check by ID' })
  @ApiResponse({ status: 200, description: 'Check found' })
  async getCheck(@Param('id') id: string): Promise<Check> {
    return this.checksService.findOne(id);
  }

  @Patch('checks/:id/clear')
  @ApiOperation({ summary: 'Clear/disburse check' })
  @ApiResponse({ status: 200, description: 'Check cleared' })
  async clearCheck(@Param('id') id: string, @Req() req: RequestWithUser): Promise<Check> {
    return this.checksService.clear(id, req.user.id);
  }

  @Patch('checks/:id/void')
  @ApiOperation({ summary: 'Void check' })
  @ApiResponse({ status: 200, description: 'Check voided' })
  async voidCheck(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: RequestWithUser,
  ): Promise<Check> {
    if (!reason) {
      throw new BadRequestException('Reason is required to void a check');
    }
    return this.checksService.void(id, req.user.id, reason);
  }
}
