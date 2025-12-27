'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
      <Sidebar 
        currentView="payments" 
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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
