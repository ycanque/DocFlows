import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Request() req: any) {
    // Get stats for the logged-in user (optionally filter by user)
    // For admin/approvers, show all stats; for regular users, show their own
    const userId: string | undefined = req.user.role === 'USER' ? req.user.userId : undefined;
    return await this.dashboardService.getStats(userId);
  }

  @Get('charts/status-distribution')
  async getStatusDistribution(@Request() req: any) {
    const userId: string | undefined = req.user.role === 'USER' ? req.user.userId : undefined;
    return await this.dashboardService.getRequisitionStatusDistribution(userId);
  }

  @Get('charts/requisition-trends')
  async getRequisitionTrends(@Request() req: any) {
    const userId: string | undefined = req.user.role === 'USER' ? req.user.userId : undefined;
    return await this.dashboardService.getRequisitionTrends(userId);
  }
}
