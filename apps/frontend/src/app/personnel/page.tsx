'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Construction } from 'lucide-react';

export default function PersonnelRequestsPage() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
        <Sidebar 
          currentView="personnel"
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900" role="main">
            <div className="p-6 sm:p-8 space-y-8">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Personnel Requests
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Manage personnel and HR-related requests
                </p>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>Personnel Requests Module</CardTitle>
                      <CardDescription>Coming Soon</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Construction className="h-16 w-16 text-zinc-300 dark:text-zinc-700 mb-4" />
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      Under Development
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
                      The personnel requests module is currently being developed. 
                      You&apos;ll be able to manage HR requests here soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
