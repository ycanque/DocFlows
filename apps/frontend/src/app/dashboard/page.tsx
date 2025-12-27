'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';

import StatCard from '@/components/dashboard/StatCard';
import QuickActionCard from '@/components/dashboard/QuickActionCard';
import SystemInfoCard from '@/components/dashboard/SystemInfoCard';
import StatusDistributionChart from '@/components/dashboard/StatusDistributionChart';
import RequisitionTrendsChart from '@/components/dashboard/RequisitionTrendsChart';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, DollarSign, CreditCard, TrendingUp } from 'lucide-react';

import TopBar from '@/components/layout/TopBar';
import { dashboardService, type DashboardStats, type StatusDistribution, type RequisitionTrend } from '@/services/dashboardService';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statusData, setStatusData] = useState<StatusDistribution[]>([]);
  const [trendData, setTrendData] = useState<RequisitionTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch chart data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartsLoading(true);
        const [statusDist, trends] = await Promise.all([
          dashboardService.getStatusDistribution(),
          dashboardService.getRequisitionTrends(),
        ]);
        setStatusData(statusDist);
        setTrendData(trends);
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
      } finally {
        setChartsLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const handleNavigate = (path: string) => {
    router.push(`/${path}`);
  };

  const quickActions = [
    {
      title: 'Create Requisition Slip',
      description: 'Submit a new requisition request',
      onClick: () => handleNavigate('requisitions'),
    },
    {
      title: 'Request Payment',
      description: 'Create a new payment request',
      onClick: () => handleNavigate('payments'),
    },
    {
      title: 'View Pending Approvals',
      description: 'Review items awaiting approval',
      onClick: () => handleNavigate('requisitions'),
    },
  ];

  const systemInfo = [
    { label: 'Department', value: user?.department?.name },
    { label: 'Role', value: user?.role?.replace('_', ' ') },
  ];

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
        <Sidebar 
          currentView={currentView} 
          onNavigate={setCurrentView}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main 
            className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900"
            role="main"
            aria-label="Main content"
          >
            <div className="p-6 sm:p-8 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Here&apos;s an overview of your document flow system
                </p>
              </div>
              
              {/* Stat cards row */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {loading ? (
                  // Loading skeleton
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="animate-pulse space-y-4">
                            <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                            <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : error ? (
                  // Error state
                  <div className="col-span-full">
                    <Card>
                      <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
                        {error}
                      </CardContent>
                    </Card>
                  </div>
                ) : stats ? (
                  // Display stats
                  <>
                    <StatCard
                      title="Requisition Slips"
                      value={stats.requisitionSlips.total}
                      icon={FileText}
                      iconColor="text-blue-600 dark:text-blue-400"
                      trend={stats.requisitionSlips.trend}
                      description={stats.requisitionSlips.description}
                      onClick={() => handleNavigate('requisitions')}
                    />
                    <StatCard
                      title="Payment Requests"
                      value={stats.paymentRequests.total}
                      icon={DollarSign}
                      iconColor="text-emerald-600 dark:text-emerald-400"
                      trend={stats.paymentRequests.trend}
                      description={stats.paymentRequests.description}
                      onClick={() => handleNavigate('payments')}
                    />
                    <StatCard
                      title="Checks Issued"
                      value={stats.checksIssued.total}
                      icon={CreditCard}
                      iconColor="text-purple-600 dark:text-purple-400"
                      trend={stats.checksIssued.trend}
                      description={stats.checksIssued.description}
                      onClick={() => handleNavigate('checks')}
                    />
                    <StatCard
                      title="Pending Approvals"
                      value={stats.pendingApprovals.total}
                      icon={TrendingUp}
                      iconColor="text-orange-600 dark:text-orange-400"
                      trend={stats.pendingApprovals.trend}
                      description={stats.pendingApprovals.description}
                      onClick={() => router.push('/requisitions?status=PENDING_APPROVAL')}
                    />
                  </>
                ) : null}
              </div>
              
              {/* Main dashboard grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Data Visualization */}
                <div className="lg:col-span-2 space-y-6">
                  {chartsLoading ? (
                    <>
                      <Card>
                        <CardContent className="p-6 h-100 flex items-center justify-center">
                          <div className="animate-pulse space-y-4 w-full">
                            <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto"></div>
                            <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6 h-100 flex items-center justify-center">
                          <div className="animate-pulse space-y-4 w-full">
                            <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto"></div>
                            <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <>
                      <RequisitionTrendsChart data={trendData} />
                      <StatusDistributionChart data={statusData} />
                    </>
                  )}
                </div>
                
                {/* Quick Actions and System Info */}
                <div className="space-y-6">
                  <QuickActionCard actions={quickActions} />
                  <SystemInfoCard items={systemInfo} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
