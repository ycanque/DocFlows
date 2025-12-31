'use client';

import { 
  LayoutDashboard, 
  FileText, 
  DollarSign, 
  RefreshCw, 
  Package, 
  Users, 
  Plane, 
  Banknote, 
  CheckSquare, 
  CreditCard, 
  FileQuestion, 
  Settings, 
  LogOut,
  Menu,
  X,
  HelpCircle,
  ChevronUp,
  UserCircle,
  CreditCard as BillingIcon,
  Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  active?: boolean;
}

interface SidebarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}


const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Main',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: 'dashboard' },
    ],
  },
  {
    label: 'Requests',
    items: [
      { icon: FileText, label: 'Requisition Slips', href: 'requisitions' },
      { icon: DollarSign, label: 'Payment Requests', href: 'payments' },
      { icon: RefreshCw, label: 'Adjustment Requests', href: 'adjustments' },
      { icon: Package, label: 'Material Issuance', href: 'materials' },
      { icon: FileQuestion, label: 'Other Requests', href: 'other' },
    ],
  },
  {
    label: 'HR & Travel',
    items: [
      { icon: Users, label: 'Personnel Requests', href: 'personnel' },
      { icon: Plane, label: 'Plane Tickets', href: 'tickets' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: Banknote, label: 'Cash Advances', href: 'advances' },
      { icon: CheckSquare, label: 'Check Vouchers', href: 'vouchers' },
      { icon: CreditCard, label: 'Checks', href: 'checks' },
    ],
  },
];

export default function Sidebar({ 
  currentView = 'dashboard', 
  onNavigate, 
  isOpen = false,
  onToggle 
}: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen && onToggle) {
        onToggle();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onToggle]);

  const handleNavClick = (href: string) => {
    router.push(`/${href}`);
    if (onToggle && isOpen) {
      onToggle();
    }
  };

  return (
    <>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-zinc-900/50 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-zinc-900/50 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col bg-white text-zinc-900 transition-transform duration-300 border-r border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
          "lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-3 px-4 py-5 flex-shrink-0">
          <img 
            src="/favicon.svg" 
            alt="DocFlows Logo" 
            className="h-9 w-9"
          />
          <div>
            <h1 className="text-base font-semibold leading-tight text-zinc-900 dark:text-zinc-50">DocFlows</h1>
          </div>
        </div>


        <nav className="flex-1 overflow-y-auto px-3 py-3 sidebar-scrollbar" style={{ paddingBottom: '68px' }} aria-label="Primary navigation">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-3">
              <div className="px-3 pb-1.5 pt-3 text-xs font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
                {group.label}
              </div>
              <ul className="space-y-0.5" role="list">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.href;
                  return (
                    <li key={item.href}>
                      <button
                        onClick={() => item.href && handleNavClick(item.href)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                          isActive
                            ? "bg-zinc-100 text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                            : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Menu Only */}
        <div className="flex-shrink-0 border-t border-zinc-200 dark:border-zinc-800 p-2 bg-white dark:bg-zinc-950">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-md px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold shadow-sm">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden text-left">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {user?.email || 'm@example.com'}
                  </p>
                </div>
                <ChevronUp className="h-4 w-4 text-zinc-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-56 mb-2">
              <DropdownMenuLabel>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {user?.email || 'm@example.com'}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log('Account')}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavClick('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Get help')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Get Help</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Billing')}>
                <BillingIcon className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Notifications')}>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-3 flex flex-col items-center gap-2">
                <img 
                  src="/cubeworks.png" 
                  alt="Cubeworks Logo" 
                  className="h-6 w-6"
                />
                <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
                  © Cubeworks Technology Consulting and Solutions, Inc.
                </p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
