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
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
  {
    label: 'System',
    items: [
      { icon: Settings, label: 'System Settings', href: 'settings' },
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
          "fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col bg-white text-zinc-900 transition-transform duration-300 border-r border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 pt-4",
          "lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-3 px-6 flex-shrink-0" style={{ height: 'var(--header-height)' }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
            DF
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Document Flow</h1>
            <p className="text-xs text-zinc-400 leading-none">System Management</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 sidebar-scrollbar" aria-label="Primary navigation">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <div className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {group.label}
              </div>
              <ul className="space-y-1" role="list">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.href;
                  return (
                    <li key={item.href}>
                      <button
                        onClick={() => item.href && handleNavClick(item.href)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white"
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 text-sm font-semibold dark:bg-zinc-800 dark:text-zinc-50">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{user?.firstName} {user?.lastName}</p>
              <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start gap-3 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
