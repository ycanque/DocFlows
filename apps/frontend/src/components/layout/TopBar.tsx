'use client';

import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';

interface TopBarProps {
  onMenuToggle?: () => void;
  title?: string;
  showMobileMenu?: boolean;
}

export default function TopBar({ onMenuToggle, showMobileMenu = true }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        {showMobileMenu && onMenuToggle && (
          <Button
            onClick={onMenuToggle}
            variant="ghost"
            size="icon"
            className="h-9 w-9 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-blue-700 text-xs font-bold text-white shadow-sm">
            DF
          </div>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Document Flow
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
          >
            Role Simulator
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
          >
            BU Simulator
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="hidden h-9 w-9 md:inline-flex hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950" aria-hidden="true" />
        </Button>

        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
