'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';

import StatCard from '@/components/dashboard/StatCard';
import QuickActionCard from '@/components/dashboard/QuickActionCard';
import SystemInfoCard from '@/components/dashboard/SystemInfoCard';
import { FileText, DollarSign, CreditCard, TrendingUp, BarChart2 } from 'lucide-react';

import TopBar from '@/components/layout/TopBar';

export default function DashboardPage() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const quickActions = [
    {
      title: 'Create Requisition Slip',
      description: 'Submit a new requisition request',
      onClick: () => setCurrentView('requisitions'),
    },
    {
      title: 'Request Payment',
      description: 'Create a new payment request',
      onClick: () => setCurrentView('payments'),
    },
    {
      title: 'View Pending Approvals',
      description: 'Review items awaiting approval',
      onClick: () => console.log('View approvals'),
    },
  ];

  const systemInfo = [
    { label: 'Department', value: user?.department?.name },
    { label: 'Position', value: user?.position },
    { label: 'Role', value: user?.role?.replace('_', ' ') },
    { label: 'Employee ID', value: user?.employeeId },
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
            className="flex-1 overflow-y-auto"
            role="main"
            aria-label="Main content"
          >
            <div className="p-4 sm:p-8">
              <h1 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
                Welcome back, {user?.role === 'SYSTEM_ADMIN' ? 'System' : user?.firstName}!
              </h1>
              <div className="mb-4">
                <p className="text-zinc-600 dark:text-zinc-400">
                  Here's an overview of your document flow system
                </p>
              </div>
              {/* Stat cards row */}
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
                <StatCard
                  title="Requisition Slips"
                  value={7}
                  icon={FileText}
                  iconBgColor="bg-blue-500"
                />
                <StatCard
                  title="Payment Requests"
                  value={4}
                  icon={DollarSign}
                  iconBgColor="bg-green-500"
                />
                <StatCard
                  title="Checks Issued"
                  value={1}
                  icon={CreditCard}
                  iconBgColor="bg-purple-500"
                />
                <StatCard
                  title="Pending Approvals"
                  value={1}
                  icon={TrendingUp}
                  iconBgColor="bg-orange-500"
                />
              </div>
              {/* Main dashboard grid: charts/activity (2/3), quick actions (1/3) */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Data Visualization/Activity */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="rounded-xl bg-white dark:bg-zinc-950 shadow p-6 min-h-[220px] flex flex-col items-center justify-center">
                    <BarChart2 className="h-10 w-10 text-zinc-300 mb-2" />
                    <span className="text-zinc-400 text-sm">Data visualization coming soon</span>
                  </div>
                  {/* Placeholder for recent activity or timeline */}
                  <div className="rounded-xl bg-white dark:bg-zinc-950 shadow p-6 min-h-[120px] flex flex-col justify-center">
                    <span className="text-zinc-400 text-sm">Recent activity will appear here</span>
                  </div>
                </div>
                {/* Quick Actions and System Info */}
                <div className="flex flex-col gap-6">
                  <QuickActionCard actions={quickActions} />
                  <SystemInfoCard items={systemInfo} small />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
