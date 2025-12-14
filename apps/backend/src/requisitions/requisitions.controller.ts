import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
}
