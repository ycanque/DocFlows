import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateRequisitionDto } from './dto/create-requisition.dto';
import { UpdateRequisitionDto } from './dto/update-requisition.dto';
import { RequisitionsService } from './requisitions.service';

@ApiTags('requisitions')
@ApiBearerAuth('JWT')
@Controller('requisitions')
@UseGuards(JwtAuthGuard)
export class RequisitionsController {
  constructor(private readonly requisitionsService: RequisitionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new requisition' })
  @ApiResponse({ status: 201, description: 'Requisition created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: CreateRequisitionDto) {
    return this.requisitionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all requisitions' })
  @ApiResponse({ status: 200, description: 'List of requisitions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.requisitionsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search requisitions by requisition number' })
  @ApiResponse({ status: 200, description: 'Search results' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  search(@Query('q') query: string) {
    return this.requisitionsService.search(query || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a requisition by ID' })
  @ApiResponse({ status: 200, description: 'Requisition found' })
  @ApiResponse({ status: 404, description: 'Requisition not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.requisitionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a requisition' })
  @ApiResponse({ status: 200, description: 'Requisition updated successfully' })
  @ApiResponse({ status: 404, description: 'Requisition not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() dto: UpdateRequisitionDto) {
    return this.requisitionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a requisition' })
  @ApiResponse({ status: 200, description: 'Requisition deleted successfully' })
  @ApiResponse({ status: 404, description: 'Requisition not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.requisitionsService.remove(id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit requisition for approval' })
  @ApiResponse({ status: 200, description: 'Requisition submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Requisition not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  submit(@Param('id') id: string, @Request() req: any) {
    return this.requisitionsService.submit(id, req.user.id);
  }

  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.APPROVER, UserRole.DEPARTMENT_HEAD, UserRole.FINANCE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve requisition at current level' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comments: { type: 'string', example: 'Approved for processing' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Requisition approved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Requisition not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  approve(@Param('id') id: string, @Request() req: any, @Body() body?: { comments?: string }) {
    return this.requisitionsService.approve(id, req.user.id, body?.comments);
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.APPROVER, UserRole.DEPARTMENT_HEAD, UserRole.FINANCE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Reject requisition' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'Insufficient justification' },
        comments: { type: 'string', example: 'Insufficient justification' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Requisition rejected successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Requisition not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  reject(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body?: { reason?: string; comments?: string },
  ) {
    return this.requisitionsService.reject(id, req.user.id, body?.reason || body?.comments);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel requisition' })
  @ApiResponse({ status: 200, description: 'Requisition cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Requisition not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.requisitionsService.cancel(id, req.user.id);
  }

  @Get(':id/approval-history')
  @ApiOperation({ summary: 'Get approval history for requisition' })
  @ApiResponse({ status: 200, description: 'Approval history retrieved' })
  @ApiResponse({ status: 404, description: 'Requisition not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getApprovalHistory(@Param('id') id: string) {
    return this.requisitionsService.getApprovalHistory(id);
  }
}
