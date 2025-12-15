import api from "@/lib/api";

export interface DashboardStats {
  requisitionSlips: {
    total: number;
    trend: {
      value: string;
      direction: "up" | "down";
    };
    description: string;
  };
  paymentRequests: {
    total: number;
    trend: {
      value: string;
      direction: "up" | "down";
    };
    description: string;
  };
  checksIssued: {
    total: number;
    trend: {
      value: string;
      direction: "up" | "down";
    };
    description: string;
  };
  pendingApprovals: {
    total: number;
    trend: {
      value: string;
      direction: "up" | "down";
    };
    description: string;
  };
}

export interface StatusDistribution {
  status: string;
  count: number;
  label: string;
}

export interface RequisitionTrend {
  date: string;
  count: number;
  label: string;
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>("/dashboard/stats");
    return response.data;
  },

  /**
   * Get requisition status distribution for pie/donut chart
   */
  async getStatusDistribution(): Promise<StatusDistribution[]> {
    const response = await api.get<StatusDistribution[]>(
      "/dashboard/charts/status-distribution"
    );
    return response.data;
  },

  /**
   * Get requisition trends over time for line chart
   */
  async getRequisitionTrends(): Promise<RequisitionTrend[]> {
    const response = await api.get<RequisitionTrend[]>(
      "/dashboard/charts/requisition-trends"
    );
    return response.data;
  },
};
