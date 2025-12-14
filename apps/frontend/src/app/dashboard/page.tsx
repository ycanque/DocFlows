'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ThemeToggle from '@/components/ThemeToggle';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        {/* Header */}
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              DocFlows Dashboard
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {user?.role}
                </p>
              </div>
              
              <ThemeToggle />
              
              <button
                onClick={logout}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Welcome back, {user?.firstName}!
              </h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                You are logged in as <span className="font-medium">{user?.email}</span>
              </p>
            </div>

            {/* User Details Card */}
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Your Profile
              </h3>
              
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {user?.email}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Role
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {user?.role}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Department
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {user?.department?.name || 'N/A'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Status
                  </dt>
                  <dd className="mt-1">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      user?.isActive 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Quick Actions
              </h3>
              
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <button className="rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800">
                  View Requisitions
                </button>
                
                <button className="rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800">
                  Create New Request
                </button>
                
                <button className="rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800">
                  View Approvals
                </button>
              </div>
            </div>

            {/* API Status */}
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                System Status
              </h3>
              
              <div className="mt-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Backend API connected
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
