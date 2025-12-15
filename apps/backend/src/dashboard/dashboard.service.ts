import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DashboardStats {
  requisitionSlips: {
    total: number;
    trend: {
      value: string;
      direction: 'up' | 'down';
    };
    description: string;
  };
  paymentRequests: {
    total: number;
    trend: {
      value: string;
      direction: 'up' | 'down';
    };
    description: string;
  };
  checksIssued: {
    total: number;
    trend: {
      value: string;
      direction: 'up' | 'down';
    };
    description: string;
  };
  pendingApprovals: {
    total: number;
    trend: {
      value: string;
      direction: 'up' | 'down';
    };
    description: string;
  };
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId?: string): Promise<DashboardStats> {
    // Calculate date ranges for trend comparison
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get current month requisition slips
    const currentMonthRequisitions = await this.prisma.requisitionSlip.count({
      where: {
        createdAt: { gte: currentMonthStart },
        ...(userId ? { requesterId: userId } : {}),
      },
    });

    // Get last month requisition slips
    const lastMonthRequisitions = await this.prisma.requisitionSlip.count({
      where: {
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        ...(userId ? { requesterId: userId } : {}),
      },
    });

    // Get current month payment requests
    const currentMonthPayments = await this.prisma.requisitionForPayment.count({
      where: {
        createdAt: { gte: currentMonthStart },
        ...(userId ? { requesterId: userId } : {}),
      },
    });

    // Get last month payment requests
    const lastMonthPayments = await this.prisma.requisitionForPayment.count({
      where: {
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        ...(userId ? { requesterId: userId } : {}),
      },
    });

    // Get current month checks issued (RFPs with CHECK_ISSUED or DISBURSED status)
    const currentMonthChecks = await this.prisma.requisitionForPayment.count({
      where: {
        status: { in: ['CHECK_ISSUED', 'DISBURSED'] },
        updatedAt: { gte: currentMonthStart },
        ...(userId ? { requesterId: userId } : {}),
      },
    });

    // Get last month checks issued
    const lastMonthChecks = await this.prisma.requisitionForPayment.count({
      where: {
        status: { in: ['CHECK_ISSUED', 'DISBURSED'] },
        updatedAt: { gte: lastMonthStart, lte: lastMonthEnd },
        ...(userId ? { requesterId: userId } : {}),
      },
    });

    // Get pending approvals (requisition slips + payment requests in pending approval state)
    const pendingRequisitions = await this.prisma.requisitionSlip.count({
      where: {
        status: 'PENDING_APPROVAL',
        ...(userId ? { requesterId: userId } : {}),
      },
    });

    const pendingPayments = await this.prisma.requisitionForPayment.count({
      where: {
        status: 'PENDING_APPROVAL',
        ...(userId ? { requesterId: userId } : {}),
      },
    });

    const totalPendingApprovals = pendingRequisitions + pendingPayments;

    // Calculate trends
    const requisitionTrend = this.calculateTrend(currentMonthRequisitions, lastMonthRequisitions);
    const paymentTrend = this.calculateTrend(currentMonthPayments, lastMonthPayments);
    const checksTrend = this.calculateTrend(currentMonthChecks, lastMonthChecks);

    // For pending approvals, calculate trend based on last 7 days vs previous 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentPendingRequisitions = await this.prisma.requisitionSlip.count({
      where: {
        status: 'PENDING_APPROVAL',
        updatedAt: { gte: sevenDaysAgo },
        ...(userId ? { requesterId: userId } : {}),
      },
    });

    const previousPendingRequisitions = await this.prisma.requisitionSlip.count({
      where: {
        status: 'PENDING_APPROVAL',
        updatedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        ...(userId ? { requesterId: userId } : {}),
      },
    });

    const recentPendingPayments = await this.prisma.requisitionForPayment.count({
      where: {
        status: 'PENDING_APPROVAL',
        updatedAt: { gte: sevenDaysAgo },
        ...(userId ? { requesterId: userId } : {}),
      },
    });

    const previousPendingPayments = await this.prisma.requisitionForPayment.count({
      where: {
        status: 'PENDING_APPROVAL',
        updatedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        ...(userId ? { requesterId: userId } : {}),
      },
    });

    const recentPending = recentPendingRequisitions + recentPendingPayments;
    const previousPending = previousPendingRequisitions + previousPendingPayments;

    const approvalsTrend = this.calculateTrend(recentPending, previousPending);

    return {
      requisitionSlips: {
        total: currentMonthRequisitions,
        trend: requisitionTrend,
        description:
          requisitionTrend.direction === 'up'
            ? 'Trending up this month'
            : 'Trending down this month',
      },
      paymentRequests: {
        total: currentMonthPayments,
        trend: paymentTrend,
        description:
          paymentTrend.direction === 'up'
            ? `Up ${paymentTrend.value} this period`
            : `Down ${paymentTrend.value} this period`,
      },
      checksIssued: {
        total: currentMonthChecks,
        trend: checksTrend,
        description:
          checksTrend.direction === 'up' ? 'Strong performance' : 'Lower than last period',
      },
      pendingApprovals: {
        total: totalPendingApprovals,
        trend: approvalsTrend,
        description:
          approvalsTrend.direction === 'up' ? 'Increased pending items' : 'Decreased pending items',
      },
    };
  }

  private calculateTrend(
    current: number,
    previous: number,
  ): { value: string; direction: 'up' | 'down' } {
    if (previous === 0) {
      return {
        value: current > 0 ? '+100%' : '0%',
        direction: current > 0 ? 'up' : 'down',
      };
    }

    const percentChange = ((current - previous) / previous) * 100;
    const direction = percentChange >= 0 ? 'up' : 'down';
    const value = `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`;

    return { value, direction };
  }

  async getRequisitionStatusDistribution(userId?: string) {
    const statusCounts = await this.prisma.requisitionSlip.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      where: userId ? { requesterId: userId } : {},
    });

    return statusCounts.map((item) => ({
      status: item.status,
      count: item._count.status,
      label: this.formatStatusLabel(item.status),
    }));
  }

  async getRequisitionTrends(userId?: string) {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    // Get all requisitions from the last 3 months
    const requisitions = await this.prisma.requisitionSlip.findMany({
      where: {
        createdAt: { gte: threeMonthsAgo },
        ...(userId ? { requesterId: userId } : {}),
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by week
    const weeklyData = new Map<string, number>();

    requisitions.forEach((req) => {
      const date = new Date(req.createdAt);
      const weekStart = this.getWeekStart(date);
      const key = weekStart.toISOString().split('T')[0];

      weeklyData.set(key, (weeklyData.get(key) || 0) + 1);
    });

    // Convert to array and fill missing weeks with 0
    const result: Array<{ date: string; count: number; label: string }> = [];
    const currentDate = new Date(threeMonthsAgo);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= now) {
      const weekStart = this.getWeekStart(currentDate);
      const key = weekStart.toISOString().split('T')[0];

      result.push({
        date: key,
        count: weeklyData.get(key) || 0,
        label: this.formatWeekLabel(weekStart),
      });

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return result;
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  private formatWeekLabel(date: Date): string {
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }

  private formatStatusLabel(status: string): string {
    return status
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }
}
