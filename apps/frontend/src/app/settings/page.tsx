'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import SettingsContent from '@/components/settings/SettingsContent';
import { useState } from 'react';

import TopBar from '@/components/layout/TopBar';

export default function SettingsPage() {
  const [currentView, setCurrentView] = useState('settings');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          <TopBar 
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            title="Settings"
          />
          
          <main 
            className="flex-1 overflow-y-auto"
            role="main"
            aria-label="Settings"
          >
            <div className="p-4 sm:p-8">
              <SettingsContent />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
