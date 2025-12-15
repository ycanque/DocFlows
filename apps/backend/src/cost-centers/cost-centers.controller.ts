import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CostCentersService } from './cost-centers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cost-centers')
@UseGuards(JwtAuthGuard)
export class CostCentersController {
  constructor(private readonly costCentersService: CostCentersService) {}

  @Get()
  findAll() {
    return this.costCentersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.costCentersService.findOne(id);
  }
}
