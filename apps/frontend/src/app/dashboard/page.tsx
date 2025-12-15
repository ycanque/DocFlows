'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';

import StatCard from '@/components/dashboard/StatCard';
import QuickActionCard from '@/components/dashboard/QuickActionCard';
import SystemInfoCard from '@/components/dashboard/SystemInfoCard';
import { Card, CardContent } from '@/components/ui/card';
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
                  Here's an overview of your document flow system
                </p>
              </div>
              
              {/* Stat cards row */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Requisition Slips"
                  value={7}
                  icon={FileText}
                  iconColor="text-blue-600 dark:text-blue-400"
                  trend={{ value: '+12.5%', direction: 'up' }}
                  description="Trending up this month"
                />
                <StatCard
                  title="Payment Requests"
                  value={4}
                  icon={DollarSign}
                  iconColor="text-emerald-600 dark:text-emerald-400"
                  trend={{ value: '-20%', direction: 'down' }}
                  description="Down 20% this period"
                />
                <StatCard
                  title="Checks Issued"
                  value={1}
                  icon={CreditCard}
                  iconColor="text-purple-600 dark:text-purple-400"
                  trend={{ value: '+12.5%', direction: 'up' }}
                  description="Strong user retention"
                />
                <StatCard
                  title="Pending Approvals"
                  value={1}
                  icon={TrendingUp}
                  iconColor="text-orange-600 dark:text-orange-400"
                  trend={{ value: '+4.5%', direction: 'up' }}
                  description="Steady performance increase"
                />
              </div>
              
              {/* Main dashboard grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Data Visualization/Activity */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardContent className="p-6 min-h-[320px] flex flex-col items-center justify-center">
                      <BarChart2 className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-3" />
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Data visualization coming soon</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Total for the last 3 months</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 min-h-[160px] flex flex-col justify-center">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Recent activity will appear here</p>
                    </CardContent>
                  </Card>
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
